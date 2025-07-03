const express = require('express');
const path = require('path');
const { db, addFavorite, removeFavorite, isFavorite, getAllFavorites } = require('../db/db');
const router = express.Router();

// Use the same media base URL as your downloaded tracks
const mediaBaseUrl = 'http://localhost:3000/media/';

// GET /api/favorites
router.get('/', (req, res) => {
  try {
    const favorites = getAllFavorites();
    
    // Transform each favorite to match the same format as downloaded tracks
    const favoritesWithUrls = favorites.map(track => ({
      ...track,
      // Use the same filename extraction pattern as downloaded tracks
      filename: track.file_path ? path.basename(track.file_path) : null,
      // Use the same URL pattern as downloaded tracks
      url: track.file_path ? mediaBaseUrl + encodeURIComponent(path.basename(track.file_path)) : null,
      // Format cover URL the same way as downloaded tracks
      cover: track.cover ? (
        track.cover.startsWith('http') 
          ? track.cover 
          : mediaBaseUrl + encodeURIComponent(track.cover)
      ) : '/default_cover.jpeg',
      // Ensure consistent field names
      title: track.title || 'Unknown Title',
      artist: track.artist || 'Unknown Artist',
      album: track.album || 'Unknown Album',
      duration: track.duration || '3:45'
    }));
    
    console.log('Favorites with URLs:', favoritesWithUrls); // Debug log
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
    addFavorite(spotifyId);
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
    removeFavorite(spotifyId);
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error('Error removing favorite:', err);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// GET /api/favorites/:spotifyId
router.get('/:spotifyId', (req, res) => {
  try {
    const result = isFavorite(req.params.spotifyId);
    res.json({ isFavorite: !!result });
  } catch (err) {
    console.error('Error checking favorite status:', err);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

module.exports = router;