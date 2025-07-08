const express = require('express');
const path = require('path');
const {
  addFavorite,
  removeFavorite,
  isFavorite,
  getAllFavorites
} = require('../db/db');
const { authenticateToken } = require('./auth');
const router = express.Router();

router.use(authenticateToken); // protect all routes

const mediaBaseUrl = 'http://localhost:3000/media/';

// GET /api/favorites
router.get('/', (req, res) => {
  try {
    const favorites = getAllFavorites(req.userId); // Pass user ID!

    const favoritesWithUrls = favorites.map(track => ({
      ...track,
      filename: track.file_path ? path.basename(track.file_path) : null,
      url: track.file_path ? mediaBaseUrl + encodeURIComponent(path.basename(track.file_path)) : null,
      cover: track.cover?.startsWith('http')
        ? track.cover
        : mediaBaseUrl + encodeURIComponent(track.cover || 'default_cover.jpeg'),
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration
    }));

    res.json(favoritesWithUrls);
  } catch (err) {
    console.error('Error fetching favorites:', err);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// POST /api/favorites
router.post('/', (req, res) => {
  const { spotifyId } = req.body;
  try {
    addFavorite(req.userId, spotifyId); // ✅ use userId
    res.status(201).json({ message: 'Added to favorites' });
  } catch (err) {
    console.error('Error adding favorite:', err);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// DELETE /api/favorites/:spotifyId
router.delete('/:spotifyId', (req, res) => {
  const { spotifyId } = req.params;
  try {
    removeFavorite(req.userId, spotifyId); // ✅ use userId
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error('Error removing favorite:', err);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// GET /api/favorites/:spotifyId
router.get('/:spotifyId', (req, res) => {
  try {
    const result = isFavorite(req.userId, req.params.spotifyId); // ✅ use userId
    res.json({ isFavorite: !!result });
  } catch (err) {
    console.error('Error checking favorite status:', err);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

module.exports = router;
