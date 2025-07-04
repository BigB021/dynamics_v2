const express = require('express');
const fetch = require('node-fetch');
const { getSpotifyAccessToken } = require('../spotify/tokenManager');

const router = express.Router();

const safeFetchJSON = async (url, headers) => {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`❌ Bad response from ${url}: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.warn(`❌ Fetch error from ${url}:`, e);
    return null;
  }
};

const getRandomItems = (array, count) => {
  if (!Array.isArray(array) || array.length === 0) return [];
  return array.sort(() => 0.5 - Math.random()).slice(0, count);
};

const mapAlbum = (album) => ({
  id: album.id,
  name: album.name,
  artist: album.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
  cover: album.images?.[0]?.url || null,
  releaseDate: album.release_date || null,
  totalTracks: album.total_tracks || 0,
});

router.get('/', async (req, res) => {
  try {
    const token = await getSpotifyAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    const market = 'US'; // fixed for simplicity, or randomize

    // Fetch new releases
    const newReleasesData = await safeFetchJSON(
      `https://api.spotify.com/v1/browse/new-releases?limit=10&country=${market}`, 
      headers
    );

    // Fetch featured playlists
    const featuredPlaylistsData = await safeFetchJSON(
      `https://api.spotify.com/v1/browse/featured-playlists?limit=5&country=${market}`, 
      headers
    );

    const albums = newReleasesData?.albums?.items
      ? newReleasesData.albums.items.map(mapAlbum)
      : [];

    const featuredPlaylists = featuredPlaylistsData?.playlists?.items
      ? featuredPlaylistsData.playlists.items.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          cover: p.images?.[0]?.url || null,
          trackCount: p.tracks?.total || 0
        }))
      : [];

    res.json({
      greeting: 'Welcome, guest! Enjoy some fresh music.',
      albums,
      featuredPlaylists,
      metadata: {
        market,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (err) {
    console.error('❌ Error in /api/guest-home:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch guest homepage data',
      albums: [],
      featuredPlaylists: [],
      metadata: {
        market: 'US',
        timestamp: new Date().toISOString(),
        error: true
      }
    });
  }
});

module.exports = router;
