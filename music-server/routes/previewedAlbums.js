const express = require('express');
const fetch = require('node-fetch');
const { getSpotifyAccessToken } = require('../spotify/tokenManager');

const router = express.Router();

router.get('/:spotify_id', async (req, res) => {
  const spotifyId = req.params.spotify_id;
  try {
    const token = await getSpotifyAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    const albumRes = await fetch(`https://api.spotify.com/v1/albums/${spotifyId}`, { headers });
    if (!albumRes.ok) return res.status(albumRes.status).json({ error: 'Album not found' });
    const albumData = await albumRes.json();

    const album = {
      id: albumData.id,
      name: albumData.name,
      artist: albumData.artists.map(a => a.name).join(', '),
      release_date: albumData.release_date,
      cover: albumData.images[0]?.url || null,
    };

    const tracks = albumData.tracks.items.map(track => ({
      spotify_id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: album.name,
      release_date: album.release_date,
      duration: Math.floor(track.duration_ms / 1000),
      preview_url: track.preview_url,
      cover: album.cover,
      url: `https://open.spotify.com/track/${track.id}`,
    }));

    res.json({ album, tracks });

  } catch (err) {
    console.error('❌ Error fetching album preview:', err);
    res.status(500).json({ error: 'Failed to fetch album preview' });
  }
});

module.exports = router;
