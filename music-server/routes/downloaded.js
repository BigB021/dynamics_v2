const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const mediaDir = path.resolve(process.env.DOWNLOAD_DIR || './media');

router.get('/', (req, res) => {
  fs.readdir(mediaDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to read media folder' });

    const audioFiles = files.filter(f => f.endsWith('.mp3') || f.endsWith('.flac') || f.endsWith('.wav'));

    // Map to objects with URLs
    const tracks = audioFiles.map(filename => ({
      filename,
      url: `http://localhost:3000/media/${encodeURIComponent(filename)}`,
    }));

    res.json(tracks);
  });
});

module.exports = router;
