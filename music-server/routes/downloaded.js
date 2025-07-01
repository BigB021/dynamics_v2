const express = require('express');
const path = require('path');
const { getAllDownloads } = require('../db/db'); 
const router = express.Router();

const mediaBaseUrl = 'http://localhost:3000/media/';

router.get('/', (req, res) => {
  try {
    // Fetch all downloaded tracks from DB
    const downloads = getAllDownloads();

    const tracks = downloads.map(track => ({
      filename: path.basename(track.file_path),
      url: mediaBaseUrl + encodeURIComponent(path.basename(track.file_path)),
      artist: track.artist || 'Unknown Artist',
      title: track.title || 'Unknown Title',
      cover: track.cover ? mediaBaseUrl + encodeURIComponent(track.cover) : '/default_cover.jpeg'
    }));

    res.json(tracks);
  } catch (err) {
    console.error('Error fetching downloaded tracks:', err);
    res.status(500).json({ error: 'Failed to get downloaded tracks' });
  }
});

module.exports = router;
