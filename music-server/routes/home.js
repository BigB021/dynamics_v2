const express = require('express');
const fetch = require('node-fetch');
const { getSpotifyAccessToken } = require('../spotify/tokenManager');

const router = express.Router();

async function safeFetchJSON(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.warn(`Bad response from ${url}: ${res.status}`);
    return null;
  }
  try {
    return await res.json();
  } catch {
    console.warn(`Failed to parse JSON from ${url}`);
    return null;
  }
}


router.get('/', async (req, res) => {
  try {
    const token = await getSpotifyAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    // --- 1. Featured Playlists ---
    const featuredRes = await fetch('https://api.spotify.com/v1/browse/featured-playlists?limit=6', { headers });
    const featuredData = await featuredRes.json();
    const playlists = featuredData.playlists?.items.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      cover: p.images?.[0]?.url || null,
      trackCount: p.tracks.total,
    })) || [];

    // --- 2. New Releases ---
    const newReleasesRes = await fetch('https://api.spotify.com/v1/browse/new-releases?limit=6', { headers });
    const newReleasesData = await newReleasesRes.json();
    const albums = newReleasesData.albums?.items.map(a => ({
      id: a.id,
      name: a.name,
      artist: a.artists.map(artist => artist.name).join(', '),
      cover: a.images?.[0]?.url || null,
      releaseDate: a.release_date,
      totalTracks: a.total_tracks,
    })) || [];

    // --- 3. Artist Spotlight (The Weeknd) ---
    const weekndRes = await fetch('https://api.spotify.com/v1/artists/1Xyo4u8uXC1ZmMpatF05PJ/top-tracks?market=US', { headers });
    const weekndData = await weekndRes.json();
    const recent = weekndData.tracks?.slice(0, 6).map(t => ({
      id: t.id,
      title: t.name,
      artist: t.artists.map(a => a.name).join(', '),
      album: t.album.name,
      cover: t.album.images?.[0]?.url || null,
      duration: Math.floor(t.duration_ms / 1000),
      spotify_id: t.id,
      preview_url: t.preview_url, 

    })) || [];

    // --- 4. Genre-Based Recommendations (Static Genres for Now) ---
    const genres = ['hip-hop', 'rock', 'electronic'];
    const genreSections = [];
    
    for (const genre of genres) {
      try {
        const recData = await safeFetchJSON(`https://api.spotify.com/v1/recommendations?limit=6&seed_genres=${genre}`, headers);
    
        if (!recData.tracks) {
          console.warn(`No tracks found for genre ${genre}`);
          continue;
        }
    
        const tracks = recData.tracks.map(t => ({
          id: t.id,
          title: t.name,
          artist: t.artists.map(a => a.name).join(', '),
          album: t.album.name,
          cover: t.album.images?.[0]?.url || null,
          duration: Math.floor(t.duration_ms / 1000),
          spotify_id: t.id,
        }));
    
        genreSections.push({
          genre,
          tracks,
        });
      } catch (err) {
        console.error(`Failed to fetch recommendations for genre "${genre}"`, err);
        // skip silently
      }
    }
    

    // --- Final JSON ---
    res.json({
      greeting: 'Welcome back!',
      playlists,
      albums,
      recent,           
      genreSections,    
      favorites: [],     
    });

  } catch (err) {
    console.error('Error fetching home data:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;
