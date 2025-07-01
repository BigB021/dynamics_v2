const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { downloadWithSpotDL, getProgress } = require('../downloader/spotdl');
const {getDownloadBySpotifyId,deleteDownloadBySpotifyId} = require('../db/db')

const router = express.Router();

const tasks = {}; // taskId => Promise



router.get('/check', (req, res) => {
  const { spotifyId } = req.query;
  if (!spotifyId) return res.status(400).json({ error: 'Missing spotifyId query param' });

  try {
    const download = getDownloadBySpotifyId(spotifyId);

    if (download && download.status === 'downloaded') {
      const fileExists = fs.existsSync(download.file_path);

      if (fileExists) {
        return res.json({ downloaded: true, filePath: download.file_path });
      } else {
        console.warn(`🧹 File missing for ${spotifyId}, removing DB entry.`);
        deleteDownloadBySpotifyId(spotifyId);
        return res.json({ downloaded: false });
      }
    }

    return res.json({ downloaded: false });
  } catch (err) {
    console.error('❌ Error in /check:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start download
router.post('/', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing Spotify URL' });

  const taskId = uuidv4();
  tasks[taskId] = downloadWithSpotDL(url, taskId).catch(() => {}); // prevent unhandled rejections

  res.json({ taskId, message: 'Download started' });
});

// SSE endpoint for progress
router.get('/progress/:taskId', (req, res) => {
  const { taskId } = req.params;

  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
  });

  let interval; 

  const sendProgress = () => {
    const progress = getProgress(taskId);
    // Send stringified JSON object with state and message
    res.write(`data: ${JSON.stringify(progress)}\n\n`);

    if (progress.state === 'finished' || progress.state === 'error') {
      clearInterval(interval);
      res.end();
    }
  };


  interval = setInterval(sendProgress, 1000);
  sendProgress();

  req.on('close', () => {
    clearInterval(interval);
  });
});

module.exports = router;
