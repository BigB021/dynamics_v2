const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const { getDownloadBySpotifyId, addDownload } = require('../db/db');
const glob = require('glob');


dotenv.config();

const downloadDir = path.resolve(process.env.DOWNLOAD_DIR || path.join(__dirname, '..', 'media'));
const spotdlPath = '/home/youssef/spotdl-venv/bin/spotdl';

const downloads = {}; // taskId => { state, message }

function extractSpotifyId(url) {
  const match = url.match(/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

function sanitizeFileName(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim();
}

function downloadWithSpotDL(url, taskId) {
  return new Promise((resolve, reject) => {
    const spotifyId = extractSpotifyId(url);
    if (!spotifyId) {
      const msg = 'Invalid Spotify URL';
      downloads[taskId] = { state: 'error', message: msg };
      return reject(new Error(msg));
    }

    // Check if already downloaded
    const existing = getDownloadBySpotifyId(spotifyId);
    if (existing && existing.status === 'downloaded') {
      const msg = 'Track already downloaded';
      downloads[taskId] = { state: 'finished', message: msg };
      console.log(`[${taskId}] Skipped: ${msg}`);
      return resolve(msg);
    }

    const outputTemplate = path.join(downloadDir, '{artist} - {title}.%(ext)s');
    const args = ['--output', outputTemplate, url];
    const proc = spawn(spotdlPath, args, {
      env: {
        ...process.env,
        SPOTIPY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
        SPOTIPY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
      },
    });

    downloads[taskId] = { state: 'start', message: 'Download started' };
    console.log(`[${taskId}] State: start`);

    let stdoutBuffer = '';
    let artist = '';
    let title = '';
    let finalFilePath = null;

    proc.stdout.on('data', (data) => {
      stdoutBuffer += data.toString();
      const parts = stdoutBuffer.split('\n');
      stdoutBuffer = parts.pop();

      for (const part of parts) {
        const line = part.trim();
        console.log(`[${taskId}] stdout raw line: ${line}`);

        if (downloads[taskId].state !== 'downloading') {
          downloads[taskId] = { state: 'downloading', message: 'Downloading in progress' };
          console.log(`[${taskId}] State: downloading`);
        }

        // Detect downloaded track info line
        const metadataMatch = line.match(/^Downloaded\s+"(.*?)\s*-\s*(.+)":/);
        if (metadataMatch) {
          artist = sanitizeFileName(metadataMatch[1]);
          title = sanitizeFileName(metadataMatch[2]);
          const fileName = `${artist} - ${title}.mp3`;
          const safeFileName = sanitizeFileName(fileName);
          finalFilePath = path.join(downloadDir, safeFileName);
          console.log(`[${taskId}] Parsed artist/title: ${artist} - ${title}`);
        }

        console.log(`[${taskId}] Output: ${line}`);
      }
    });

    proc.stderr.on('data', (data) => {
      const text = data.toString();
      console.error(`[${taskId}] STDERR: ${text.trim()}`);

      if (/rate\/request limit/i.test(text)) {
        downloads[taskId] = { state: 'error', message: 'Rate/request limit error' };
      } else if (/error/i.test(text)) {
        downloads[taskId] = { state: 'error', message: `Error: ${text.trim()}` };
      }
    });

    proc.on('error', (err) => {
      downloads[taskId] = { state: 'error', message: `Process error: ${err.message}` };
      console.error(`[${taskId}] Process error: ${err.message}`);
      reject(err);
    });


    proc.on('close', (code) => {
      if (code === 0) {
        // Find newest .mp3 in downloadDir as fallback (most recent download)
        const mp3s = glob.sync(path.join(downloadDir, '*.mp3'));
        if (mp3s.length === 0) {
          const msg = `No mp3 files found in ${downloadDir}`;
          downloads[taskId] = { state: 'error', message: msg };
          return reject(new Error(msg));
        }
      
        // Sort by mtime descending, newest first
        mp3s.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
        finalFilePath = mp3s[0];
      
        console.log(`[${taskId}] Using fallback latest mp3 file: ${finalFilePath}`);
      
        if (fs.existsSync(finalFilePath)) {
          addDownload(spotifyId, finalFilePath, 'downloaded', artist, title);
          downloads[taskId] = { state: 'finished', message: 'Download finished successfully' };
          resolve('Download finished successfully');
        } else {
          const msg = `File not found after fallback path check: ${finalFilePath}`;
          downloads[taskId] = { state: 'error', message: msg };
          reject(new Error(msg));
        }
      } else {
        downloads[taskId] = { state: 'error', message: `Download failed with exit code ${code}` };
        reject(new Error(`Download failed with code ${code}`));
      }
    });

  });
}

function getProgress(taskId) {
  return downloads[taskId] || { state: 'unknown', message: 'No such task' };
}

module.exports = { downloadWithSpotDL, getProgress };
