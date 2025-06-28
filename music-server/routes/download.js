const express = require('express');
const { downloadWithSpotDL, getProgress } = require('../downloader/spotdl');
const { v4: uuidv4 } = require('uuid');


const router = express.Router();
const tasks = {}; // taskId => promise of download

router.post('/', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing Spotify URL' });

  try {
    const output = await downloadWithSpotDL(url);
    res.json({ success: true, message: 'Download finished', output });
  } catch (err) {
    console.error('Download failed:', err);
    res.status(500).json({ error: 'Download failed', details: err.message });
  }
});

module.exports = router;
