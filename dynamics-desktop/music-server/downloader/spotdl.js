const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const glob = require('glob');
const mm = require('music-metadata');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const { addDownload, addAlbum } = require('../db/db');
const { getSpotifyAccessToken } = require('../spotify/tokenManager'); 
const os = require('os');

dotenv.config();



//const spotdlPath = process.env.SPOTDL_PATH;
const spotdlPath = path.join(os.homedir(), 'dynamics', 'venv', 'bin', 'spotdl');;
const downloadDir = process.env.DOWNLOAD_DIR || path.join(os.homedir(), 'dynamics', 'media');
if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });
const downloads = {}; // taskId => { state, message }

if (!fs.existsSync(spotdlPath)) {
  throw new Error('❌ SpotDL binary not found at: ' + spotdlPath);
}

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


async function spotifyFetch(endpoint) {
  const token = await getSpotifyAccessToken();
  const res = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Spotify API error: ${res.status} ${JSON.stringify(err)}`);
  }
  return res.json();
}

async function getSpotifyTracks(entity) {
  if (entity.type === 'track') {
    const track = await spotifyFetch(`tracks/${entity.id}`);
    return [{
      id: track.id,
      title: track.name,
      artist: track.artists[0]?.name || 'Unknown',
      album: track.album.name,
    }];
  }

  if (entity.type === 'album') {
    let tracks = [];
    let limit = 50;
    let offset = 0;
    while (true) {
      const data = await spotifyFetch(`albums/${entity.id}/tracks?limit=${limit}&offset=${offset}`);
      tracks = tracks.concat(data.items.map(t => ({
        id: t.id,
        title: t.name,
        artist: t.artists[0]?.name || 'Unknown',
        album: '', 
      })));
      if (data.next) offset += limit;
      else break;
    }

    const albumInfo = await spotifyFetch(`albums/${entity.id}`);
    tracks = tracks.map(t => ({ ...t, album: albumInfo.name }));
    return tracks;
  }

  if (entity.type === 'playlist') {
    let tracks = [];
    let limit = 100;
    let offset = 0;
    while (true) {
      const data = await spotifyFetch(`playlists/${entity.id}/tracks?limit=${limit}&offset=${offset}`);
      tracks = tracks.concat(data.items.map(item => {
        const t = item.track;
        return {
          id: t.id,
          title: t.name,
          artist: t.artists[0]?.name || 'Unknown',
          album: t.album?.name || '',
        };
      }));
      if (data.next) offset += limit;
      else break;
    }
    return tracks;
  }

  return [];
}

async function downloadWithSpotDL(url, taskId, userId) {
  try {
    const entity = extractSpotifyEntity(url);
    if (!entity) {
      downloads[taskId] = { state: 'error', message: 'Invalid Spotify URL' };
      throw new Error('Invalid Spotify URL');
    }

    const spotifyTracks = await getSpotifyTracks(entity);

    const outputPath = path.join(downloadDir, '{artist} - {title}');
    const args = [
      '--output', outputPath, 
      '--bitrate', '192k', 
      '--format', 'mp3', 
      '--client-id', process.env.SPOTIFY_CLIENT_ID,
      '--client-secret', process.env.SPOTIFY_CLIENT_SECRET,
      url
    ];
    console.log("spotdl path",spotdlPath)
    console.log(`[init] Final resolved SpotDL path: ${spotdlPath}`);
    console.log(`[init] SpotDL exists?`, fs.existsSync(spotdlPath));
    console.log("[init] download directory: "+ downloadDir)

    downloads[taskId] = { state: 'start', message: 'Download started' };
    console.log(`[${taskId}] State: start`);

    await new Promise((resolve, reject) => {
      console.log(`[${taskId}] Launching SpotDL with path: ${spotdlPath}`);
      console.log(`[${taskId}] Arguments:`, args.join(' '));

      const proc = spawn(spotdlPath, args, {
        env: {
          ...process.env,
          SPOTIPY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
          SPOTIPY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
        },
      });
    
      let stdout = '';
      let stderr = '';
    
      proc.stdout.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        console.log(`[${taskId}] STDOUT: ${text.trim()}`);
      });
    
      proc.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        console.error(`[${taskId}] STDERR: ${text.trim()}`);
      });
    
      proc.on('error', (err) => {
        console.error(`[${taskId}] Spawn error: ${err.message}`);
        downloads[taskId] = {
          state: 'error',
          message: `Process error: ${err.message}`,
        };
        reject(err);
      });
    
      proc.on('close', (code) => {
        console.log(`[${taskId}] SpotDL exited with code ${code}`);
        if (code !== 0) {
          const fullError = `SpotDL exited with code ${code}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`;
          downloads[taskId] = { state: 'error', message: fullError };
          reject(new Error(fullError));
        } else {
          resolve();
        }
      });
    });


    const mp3s = glob.sync(path.join(downloadDir, '*.mp3'));
    mp3s.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    const recent = mp3s.filter(f => fs.statSync(f).mtimeMs > (Date.now() - 1000 * 60 * 5));
    if (recent.length === 0) {
      downloads[taskId] = { state: 'error', message: 'No MP3s found' };
      throw new Error('No MP3s downloaded');
    }

    const firstMeta = await mm.parseFile(recent[0]);
    let albumName = sanitizeFileName(firstMeta.common.album || '');
    const artistName = sanitizeFileName(firstMeta.common.artist || 'Unknown');
    let releaseDate = firstMeta.common.date || null;

    const coverPath = await extractCover(recent[0], downloadDir);
    const coverFileName = coverPath ? path.basename(coverPath) : null;

    let albumSpotifyId = null;
    let albumDbId = null;
      
    if (entity.type === 'album') {
      const albumInfo = await spotifyFetch(`albums/${entity.id}`);
      albumSpotifyId = albumInfo.id;
      albumName = sanitizeFileName(albumInfo.name);
      releaseDate = albumInfo.release_date || null;
    
      albumDbId = await addAlbum(albumName, artistName, coverFileName, releaseDate, albumSpotifyId);
      console.log(`[${taskId}] Album added with DB id: ${albumDbId}`);
      console.log(`[${taskId}] Saving album with Spotify ID: ${albumSpotifyId}`);
    } else {
      console.log(`[${taskId}] Not an album, skipping album DB creation`);
    }
    

    function matchTrackMeta(artist, title) {
      artist = artist.toLowerCase();
      title = title.toLowerCase();
      return spotifyTracks.find(t =>
        t.artist.toLowerCase() === artist &&
        t.title.toLowerCase() === title
      );
    }

    for (const file of recent) {
      try {
        const meta = await mm.parseFile(file);
        const artist = sanitizeFileName(meta.common.artist || 'Unknown');
        const title = sanitizeFileName(meta.common.title || 'Unknown');
        const album = sanitizeFileName(meta.common.album || '');
        const duration = meta.format.duration ? Math.round(meta.format.duration) : null;
        const release = meta.common.date || null;

        const matchedTrack = matchTrackMeta(artist, title);
        const spotifyTrackId = matchedTrack ? matchedTrack.id : uuidv4();

        if (!matchedTrack) {
          console.warn(`[${taskId}] Warning: no Spotify track ID found for ${artist} - ${title}`);
        }

        await addDownload(
          userId,
          spotifyTrackId,
          file,
          'downloaded',
          artist,
          title,
          album,
          duration,
          release,
          coverFileName
        );
      } catch (err) {
        console.error(`[${taskId}] Error processing file ${file}:`, err);
      }
    }

    downloads[taskId] = { state: 'finished', message: 'Album/tracks downloaded' };
    return 'Album/tracks downloaded';
  } catch (err) {
    downloads[taskId] = { state: 'error', message: err.message };
    throw err;
  }
}

function getProgress(taskId) {
  return downloads[taskId] || { state: 'unknown', message: 'No such task' };
}

module.exports = { downloadWithSpotDL, getProgress };