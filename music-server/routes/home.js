const express = require('express');
const fetch = require('node-fetch');
const { getSpotifyAccessToken } = require('../spotify/tokenManager');

const router = express.Router();

const FEATURED_ARTISTS = [
  '1Xyo4u8uXC1ZmMpatF05PJ', '06HL4z0CvFAxyc27GXpf02', '4dpARuHxo51G3z768sgnrY',
  '1dfeR4HaWDbWqFHLkxsg1d', '3TVXtAsR1Inumwj472S9r4', '66CXWjxzNUsdJxJ2JdwvnR',
  '4q3ewBCX7sLwd24euuV69X', '1McMsnEElThX1knmY4oliG', '5pKCCKE2ajJHZ9KAiaK11H',
  '0du5cEVh5yTK9QJze8zA0C', '7dGJo4pcD2V6oG8kP0tJRR', '1HY2Jd0NmPuamShAr6KMms',
  '7CajNmpbOovFoOoasH2HaY', '4gzpq5DPGxSnKTe4SA8HAU', '7Ln80lUS6He07XvHI8qqHH',
];

const MUSIC_GENRES = [
  'pop', 'hip-hop', 'rock', 'electronic', 'jazz', 'blues', 'country', 'r-n-b',
  'latin', 'reggae', 'folk', 'indie', 'alternative', 'classical', 'funk',
  'soul', 'punk', 'metal', 'ambient', 'house', 'techno', 'dubstep'
];

// Use more reliable markets - some smaller markets might not have all content
const MARKETS = ['US', 'GB', 'CA', 'AU', 'DE', 'FR'];

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

const getRandomOffset = (max = 50) => Math.floor(Math.random() * max);

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

// Helper function to safely map tracks with null checking
const mapTrackSafely = (track) => {
  if (!track || !track.id) return null;
  return {
    id: track.id,
    title: track.name || 'Unknown Track',
    artist: track.artists ? track.artists.map(a => a.name).join(', ') : 'Unknown Artist',
    album: track.album ? track.album.name : 'Unknown Album',
    cover: track.album && track.album.images && track.album.images[0] ? track.album.images[0].url : null,
    duration: track.duration_ms ? Math.floor(track.duration_ms / 1000) : 0,
    spotify_id: track.id,
    preview_url: track.preview_url || null,
  };
};

router.get('/', async (req, res) => {
  try {
    const token = await getSpotifyAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    const market = getRandomItems(MARKETS, 1)[0] || 'US'; // Fallback to US
    console.log(`[API] Using Spotify token for market: ${market}`);

    const [
      featuredRes,
      newReleasesRes,
      artistInfo,
      topTracksRes,
      chartRes,
      moodRes
    ] = await Promise.all([
      safeFetchJSON(`https://api.spotify.com/v1/browse/featured-playlists?limit=12&offset=${getRandomOffset(20)}&country=${market}`, headers),
      safeFetchJSON(`https://api.spotify.com/v1/browse/new-releases?limit=12&offset=${getRandomOffset(20)}&country=${market}`, headers),
      safeFetchJSON(`https://api.spotify.com/v1/artists/${getRandomItems(FEATURED_ARTISTS, 1)[0]}`, headers),
      safeFetchJSON(`https://api.spotify.com/v1/artists/${FEATURED_ARTISTS[0]}/top-tracks?market=${market}`, headers),
      // Use artist seed instead of genre for more reliable results
      safeFetchJSON(`https://api.spotify.com/v1/recommendations?limit=12&seed_artists=${getRandomItems(FEATURED_ARTISTS, 1)[0]}&market=${market}`, headers),
      safeFetchJSON(`https://api.spotify.com/v1/search?q=${getRandomItems(['chill', 'party', 'focus', 'workout'], 1)[0]}&type=playlist&limit=10&market=${market}`, headers),
    ]);

    // Safely map playlists
    const playlists = featuredRes?.playlists?.items ? 
      getRandomItems(featuredRes.playlists.items.filter(p => p && p.id), 6).map(p => ({
        id: p.id,
        name: p.name || 'Untitled Playlist',
        description: p.description || '',
        cover: p.images && p.images[0] ? p.images[0].url : null,
        trackCount: p.tracks ? p.tracks.total : 0,
      })) : [];

    // Safely map albums
    const albums = newReleasesRes?.albums?.items ? 
      getRandomItems(newReleasesRes.albums.items.filter(a => a && a.id), 6).map(a => ({
        id: a.id,
        name: a.name || 'Untitled Album',
        artist: a.artists ? a.artists.map(ar => ar.name).join(', ') : 'Unknown Artist',
        cover: a.images && a.images[0] ? a.images[0].url : null,
        releaseDate: a.release_date || null,
        totalTracks: a.total_tracks || 0
      })) : [];

    // Safely map spotlight tracks
    const spotlightTracks = topTracksRes?.tracks ? 
      getRandomItems(topTracksRes.tracks, 6)
        .map(mapTrackSafely)
        .filter(track => track !== null) : [];

    // Safely map charts
    const charts = chartRes?.tracks ? 
      getRandomItems(chartRes.tracks, 6)
        .map(mapTrackSafely)
        .filter(track => track !== null) : [];

    // Safely map mood playlists
    const moodPlaylists = moodRes?.playlists?.items ? 
      getRandomItems(moodRes.playlists.items.filter(p => p && p.id), 4).map(p => ({
        id: p.id,
        name: p.name || 'Untitled Playlist',
        description: p.description || '',
        cover: p.images && p.images[0] ? p.images[0].url : null,
        trackCount: p.tracks ? p.tracks.total : 0
      })) : [];

    // Genre Sections with better error handling
    const genreSections = [];
    const selectedGenres = getRandomItems(MUSIC_GENRES, 3);
    
    for (const genre of selectedGenres) {
      try {
        // Use multiple seed types for better reliability
        const genreData = await safeFetchJSON(
          `https://api.spotify.com/v1/recommendations?limit=8&seed_genres=${genre}&seed_artists=${getRandomItems(FEATURED_ARTISTS, 1)[0]}&market=${market}`, 
          headers
        );
        
        if (genreData?.tracks && genreData.tracks.length > 0) {
          const validTracks = genreData.tracks
            .map(mapTrackSafely)
            .filter(track => track !== null);
            
          if (validTracks.length > 0) {
            genreSections.push({
              genre: genre.charAt(0).toUpperCase() + genre.slice(1),
              tracks: getRandomItems(validTracks, 6)
            });
          }
        }
      } catch (genreError) {
        console.warn(`❌ Error fetching genre ${genre}:`, genreError.message);
      }
    }

    // Fallback data in case everything fails
    const fallbackResponse = {
      greeting: getTimeBasedGreeting(),
      artistSpotlight: {
        name: artistInfo?.name || 'Featured Artist',
        tracks: spotlightTracks
      },
      playlists: playlists.length > 0 ? playlists : [],
      albums: albums.length > 0 ? albums : [],
      charts: {
        country: market,
        tracks: charts
      },
      genreSections: genreSections.length > 0 ? genreSections : [],
      moodSection: {
        mood: moodPlaylists.length > 0 ? moodPlaylists[0].name : 'Discover',
        playlists: moodPlaylists
      },
      metadata: {
        market,
        timestamp: new Date().toISOString(),
        genres: genreSections.map(g => g.genre),
        dataAvailable: {
          playlists: playlists.length > 0,
          albums: albums.length > 0,
          charts: charts.length > 0,
          genres: genreSections.length > 0,
          mood: moodPlaylists.length > 0
        }
      }
    };

    res.json(fallbackResponse);

  } catch (err) {
    console.error('❌ Critical Error in /api/home:', err);
    
    // Return a minimal response instead of crashing
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to fetch music data at this time',
      greeting: getTimeBasedGreeting(),
      artistSpotlight: { name: 'Music Discovery', tracks: [] },
      playlists: [],
      albums: [],
      charts: { country: 'US', tracks: [] },
      genreSections: [],
      moodSection: { mood: 'Discover', playlists: [] },
      metadata: {
        market: 'US',
        timestamp: new Date().toISOString(),
        genres: [],
        error: true
      }
    });
  }
});

module.exports = router;