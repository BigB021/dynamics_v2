// spotdl.js
const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const glob = require('glob');
const mm = require('music-metadata');
const { v4: uuidv4 } = require('uuid');
const { addDownload, addAlbum } = require('../db/db');

dotenv.config();

const spotdlPath = '/home/youssef/spotdl-venv/bin/spotdl';
const downloadDir = path.resolve(process.env.DOWNLOAD_DIR || path.join(__dirname, '..', 'media'));
const downloads = {}; // taskId => { state, message }

function extractSpotifyEntity(url) {
  const match = url.match(/(track|album|playlist)\/([a-zA-Z0-9]+)/);
  return match ? { type: match[1], id: match[2] } : null;
}

function sanitizeFileName(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim();
}

async function extractCover(mp3FilePath, outputDir) {
  try {
    const metadata = await mm.parseFile(mp3FilePath);
    const pictures = metadata.common.picture;
    if (pictures && pictures.length > 0) {
      const picture = pictures[0];
      const ext = picture.format.split('/')[1] || 'jpeg';
      const coverFileName = path.basename(mp3FilePath, path.extname(mp3FilePath)) + '.' + ext;
      const coverPath = path.join(outputDir, coverFileName);
      fs.writeFileSync(coverPath, picture.data);
      return coverPath;
    }
  } catch (err) {
    console.error('Cover extraction error:', err);
  }
  return null;
}

async function downloadWithSpotDL(url, taskId) {
  return new Promise((resolve, reject) => {
    const entity = extractSpotifyEntity(url);
    if (!entity) {
      downloads[taskId] = { state: 'error', message: 'Invalid Spotify URL' };
      return reject(new Error('Invalid Spotify URL'));
    }

    const args = ['--output', path.join(downloadDir, '{artist} - {title}'), '--bitrate', '192k', '--format', 'mp3', url];
    const proc = spawn(spotdlPath, args, {
      env: {
        ...process.env,
        SPOTIPY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
        SPOTIPY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
      },
    });

    downloads[taskId] = { state: 'start', message: 'Download started' };
    console.log(`[${taskId}] State: start`);

    proc.stderr.on('data', (data) => {
      const text = data.toString();
      console.error(`[${taskId}] STDERR: ${text.trim()}`);
      if (/rate|limit|error/i.test(text)) {
        downloads[taskId] = { state: 'error', message: text.trim() };
      }
    });

    proc.on('error', (err) => {
      downloads[taskId] = { state: 'error', message: `Process error: ${err.message}` };
      return reject(err);
    });

    proc.on('close', async (code) => {
      if (code !== 0) {
        downloads[taskId] = { state: 'error', message: `Exit code ${code}` };
        return reject(new Error(`SpotDL exited with code ${code}`));
      }

      const mp3s = glob.sync(path.join(downloadDir, '*.mp3'));
      mp3s.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

      const recent = mp3s.filter(f => fs.statSync(f).mtimeMs > (Date.now() - 1000 * 60 * 5));
      if (recent.length === 0) {
        downloads[taskId] = { state: 'error', message: 'No MP3s found' };
        return reject(new Error('No MP3s downloaded'));
      }

      try {
        // Extract album info from first track metadata
        const firstMeta = await mm.parseFile(recent[0]);
        const albumName = sanitizeFileName(firstMeta.common.album || '');
        const artistName = sanitizeFileName(firstMeta.common.artist || 'Unknown');
        const releaseDate = firstMeta.common.date || null;

        // Extract cover once here
        const coverPath = await extractCover(recent[0], downloadDir);
        const coverFileName = coverPath ? path.basename(coverPath) : null;

        // Insert album record with Spotify album ID (if url is album)
        const albumSpotifyId = entity.type === 'album' ? entity.id : null;
        console.log('Adding album:', { albumName, artistName, coverFileName, releaseDate, albumSpotifyId });
        await addAlbum(albumName, artistName, coverFileName, releaseDate, albumSpotifyId);

        // Insert all tracks
        for (const file of recent) {
          try {
            const meta = await mm.parseFile(file);
            const artist = sanitizeFileName(meta.common.artist || 'Unknown');
            const title = sanitizeFileName(meta.common.title || 'Unknown');
            const album = sanitizeFileName(meta.common.album || '');
            const duration = meta.format.duration ? Math.round(meta.format.duration) : null;
            const release = meta.common.date || null;

            const spotifyTrackId = uuidv4(); // Or get real Spotify track ID if possible

            addDownload(spotifyTrackId, file, 'downloaded', artist, title, album, duration, release, coverFileName);
          } catch (err) {
            console.error(`Error processing file ${file}:`, err);
          }
        }

        downloads[taskId] = { state: 'finished', message: 'Album/tracks downloaded' };
        return resolve('Album/tracks downloaded');
      } catch (err) {
        downloads[taskId] = { state: 'error', message: 'Failed to process downloaded files' };
        return reject(err);
      }
    });
  });
}

function getProgress(taskId) {
  return downloads[taskId] || { state: 'unknown', message: 'No such task' };
}

module.exports = { downloadWithSpotDL, getProgress };
