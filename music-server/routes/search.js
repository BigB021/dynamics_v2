const express = require('express');
const fetch = require('node-fetch');
const { getSpotifyAccessToken } = require('../spotify/tokenManager');

const router = express.Router();

router.get('/', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).send({ error: 'Missing query param ?q=' });

  try {
    const token = await getSpotifyAccessToken();

    const apiRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,album&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await apiRes.json();

    if (!data.tracks && !data.albums) {
      console.error('Spotify API error response:', data);
      return res.status(500).json({ error: 'Spotify API error', details: data });
    }

    const trackResults = data.tracks?.items.map((t) => ({
      type: 'track',
      name: t.name,
      id: t.id,
      artist: t.artists.map((a) => a.name).join(', '),
      url: t.external_urls.spotify,
      album: t.album.name,
      cover: t.album.images?.[0]?.url || null,
      explicit: t.explicit, 
    })) || [];

    const albumResults = data.albums?.items.map((a) => ({
      type: 'album',
      name: a.name,
      id: a.id,
      artist: a.artists.map((artist) => artist.name).join(', '),
      url: a.external_urls.spotify,
      cover: a.images?.[0]?.url || null,
      totalTracks: a.total_tracks,
      releaseDate: a.release_date,
    })) || [];

    // Combine and send results
    res.json([...trackResults, ...albumResults]);
  } catch (error) {
    console.error('Error searching Spotify:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});


module.exports = router;
