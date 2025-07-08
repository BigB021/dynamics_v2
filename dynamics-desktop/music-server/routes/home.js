// routes/home.js
const express = require('express');
const fetch = require('node-fetch');
const { getSpotifyAccessToken } = require('../spotify/tokenManager');
const { getSmartFeaturedArtists, MUSIC_GENRES, MARKETS } = require('../constants/fetchData');

const router = express.Router();

let FEATURED_ARTISTS = [];

(async () => {
  try {
    FEATURED_ARTISTS = await getSmartFeaturedArtists();
    console.log(`🎯 Loaded ${FEATURED_ARTISTS.length} smart featured artists`);
  } catch (err) {
    console.error('❌ Failed to load smart featured artists:', err);
  }
})();

const safeFetchJSON = async (url, headers) => {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      //console.warn(`❌ Bad response from ${url}: ${res.status}`);
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

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  const greetings = {
    morning: ['Good morning!', 'Start your day with music!'],
    afternoon: ['Good afternoon!', 'Perfect time for music!'],
    evening: ['Good evening!', 'Unwind with some tunes!'],
    night: ['Late night vibes!', 'Night owl listening!']
  };
  if (hour < 12) return greetings.morning[Math.floor(Math.random() * greetings.morning.length)];
  if (hour < 17) return greetings.afternoon[Math.floor(Math.random() * greetings.afternoon.length)];
  if (hour < 22) return greetings.evening[Math.floor(Math.random() * greetings.evening.length)];
  return greetings.night[Math.floor(Math.random() * greetings.night.length)];
};

const mapTrackSafely = (track) => {
  if (!track || !track.id) return null;
  return {
    id: track.id,
    title: track.name || 'Unknown Track',
    artist: track.artists ? track.artists.map(a => a.name).join(', ') : 'Unknown Artist',
    album: track.album ? track.album.name : 'Unknown Album',
    cover: track.album?.images?.[0]?.url || null,
    duration: track.duration_ms ? Math.floor(track.duration_ms / 1000) : 0,
    spotify_id: track.id,
    preview_url: track.preview_url || null,
    url: `https://open.spotify.com/track/${track.id}`,
  };
};

router.get('/', async (req, res) => {
  try {
    const token = await getSpotifyAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    const market = getRandomItems(MARKETS, 1)[0] || 'US';

    console.log(`[API] Using Spotify token for market: ${market}`);

    const [
      newReleasesRes,
      artistInfo,
      topTracksRes,
      categoriesRes
    ] = await Promise.all([
      safeFetchJSON(`https://api.spotify.com/v1/browse/new-releases?limit=12&country=${market}`, headers),
      safeFetchJSON(`https://api.spotify.com/v1/artists/${getRandomItems(FEATURED_ARTISTS, 1)[0]}`, headers),
      safeFetchJSON(`https://api.spotify.com/v1/artists/${FEATURED_ARTISTS[0]}/top-tracks?market=${market}`, headers),
      safeFetchJSON(`https://api.spotify.com/v1/browse/categories?limit=6&country=${market}`, headers),
    ]);

    // Albums
    const albums = newReleasesRes?.albums?.items
      ? getRandomItems(newReleasesRes.albums.items.filter(a => a && a.id), 6).map(a => ({
          id: a.id,
          name: a.name || 'Untitled Album',
          artist: a.artists ? a.artists.map(ar => ar.name).join(', ') : 'Unknown Artist',
          cover: a.images?.[0]?.url || null,
          releaseDate: a.release_date || null,
          totalTracks: a.total_tracks || 0
        }))
      : [];

    // Spotlight Tracks
    const spotlightTracks = topTracksRes?.tracks
      ? getRandomItems(topTracksRes.tracks, 6).map(mapTrackSafely).filter(Boolean)
      : [];

    // Mood Sections from Categories
    const moodSections = [];

    if (categoriesRes?.categories?.items?.length) {
      for (const category of getRandomItems(categoriesRes.categories.items, 3)) {
        const playlistsRes = await safeFetchJSON(
          `https://api.spotify.com/v1/browse/categories/${category.id}/playlists?limit=6&country=${market}`,
          headers
        );

        if (playlistsRes?.playlists?.items?.length) {
          moodSections.push({
            mood: category.name,
            playlists: playlistsRes.playlists.items.map(p => ({
              id: p.id,
              name: p.name,
              description: p.description,
              cover: p.images?.[0]?.url || null,
              trackCount: p.tracks?.total || 0
            }))
          });
        }
      }
    }

    // Genre Sections via Search
    const genreSections = [];
    const selectedGenres = getRandomItems(MUSIC_GENRES, 3);

    for (const genre of selectedGenres) {
      const searchRes = await safeFetchJSON(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(genre)}&type=track&limit=8&market=${market}`,
        headers
      );

      const validTracks = searchRes?.tracks?.items
        ?.map(mapTrackSafely)
        .filter(Boolean);

      if (validTracks?.length > 0) {
        genreSections.push({
          genre: genre.charAt(0).toUpperCase() + genre.slice(1),
          tracks: validTracks
        });
      }
    }

    res.json({
      greeting: getTimeBasedGreeting(),
      artistSpotlight: {
        name: artistInfo?.name || 'Featured Artist',
        tracks: spotlightTracks
      },
      albums,
      genreSections,
      moodSections,
      metadata: {
        market,
        timestamp: new Date().toISOString(),
        genres: genreSections.map(g => g.genre),
        moods: moodSections.map(m => m.mood),
        dataAvailable: {
          albums: albums.length > 0,
          spotlight: spotlightTracks.length > 0,
          genres: genreSections.length > 0,
          moods: moodSections.length > 0
        }
      }
    });

  } catch (err) {
    console.error('❌ Critical Error in /api/home:', err);

    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to fetch music data at this time',
      greeting: getTimeBasedGreeting(),
      artistSpotlight: { name: 'Music Discovery', tracks: [] },
      albums: [],
      genreSections: [],
      moodSections: [],
      metadata: {
        market: 'US',
        timestamp: new Date().toISOString(),
        genres: [],
        moods: [],
        error: true
      }
    });
  }
});

module.exports = router;
