const express = require('express');
const { db } = require('../db/db');
const { authenticateToken } = require('./auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const userId = req.userId;

  const totalDownloads = db.prepare(`SELECT COUNT(*) AS count FROM downloads WHERE user_id = ? AND status = 'downloaded'`).get(userId).count;

  const totalFavorites = db.prepare(`SELECT COUNT(*) AS count FROM favorites WHERE user_id = ?`).get(userId).count;

  const totalPlaylists = db.prepare(`SELECT COUNT(*) AS count FROM playlists WHERE user_id = ?`).get(userId).count;

  const firstDownload = db.prepare(`SELECT MIN(downloaded_at) AS first_download FROM downloads WHERE user_id = ?`).get(userId).first_download;

  const topArtist = db.prepare(`
    SELECT artist, COUNT(*) AS count
    FROM downloads
    WHERE user_id = ? AND artist IS NOT NULL
    GROUP BY artist
    ORDER BY count DESC
    LIMIT 1
  `).get(userId);

  res.json({
    totalDownloads,
    totalFavorites,
    totalPlaylists,
    firstDownload,
    topArtist: topArtist?.artist || null
  });
});

module.exports = router;
