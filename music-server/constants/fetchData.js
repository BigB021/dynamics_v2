// constants/fetchData.js

const Database = require('better-sqlite3');
const path = require('path');
const fetch = require('node-fetch');
const { getSpotifyAccessToken } = require('../spotify/tokenManager');

const db = new Database(path.resolve(__dirname, '../db/downloads.db'));

const MUSIC_GENRES = [
  'pop', 'hip-hop', 'rock', 'electronic', 'jazz', 'blues', 'country', 'r-n-b',
  'latin', 'reggae', 'folk', 'indie', 'alternative', 'classical', 'funk',
  'soul', 'punk', 'metal', 'ambient', 'house', 'techno', 'dubstep'
];

const MARKETS = ['US', 'GB', 'CA', 'AU', 'DE', 'FR'];

// Get top downloaded artists
function getTopDownloadedArtists(limit = 10) {
  return db.prepare(`
    SELECT artist, COUNT(*) AS count
    FROM downloads
    WHERE artist IS NOT NULL
    GROUP BY artist
    ORDER BY count DESC
    LIMIT ?
  `).all(limit).map(row => row.artist);
}

// Get top favorited artists
function getTopFavoritedArtists(limit = 10) {
  return db.prepare(`
    SELECT d.artist, COUNT(*) as count
    FROM favorites f
    JOIN downloads d ON d.spotify_id = f.spotify_id
    WHERE d.artist IS NOT NULL
    GROUP BY d.artist
    ORDER BY count DESC
    LIMIT ?
  `).all(limit).map(row => row.artist);
}

// Search Spotify to get artist ID by name
async function getArtistIdByName(name, token) {
  const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  return json?.artists?.items?.[0]?.id || null;
}

// Get related artists from Spotify
async function getRelatedArtistIds(artistId, token) {
  const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}/related-artists`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  return json?.artists?.slice(0, 3).map(a => a.id) || [];
}

// Build smart featured artists list
async function getSmartFeaturedArtists() {
  const token = await getSpotifyAccessToken();
  const names = [...new Set([
    ...getTopDownloadedArtists(10),
    ...getTopFavoritedArtists(10),
  ])];

  const ids = new Set();

  for (const name of names) {
    const id = await getArtistIdByName(name, token);
    if (id) {
      ids.add(id);
      const related = await getRelatedArtistIds(id, token);
      related.forEach(rid => ids.add(rid));
    }
  }

  return Array.from(ids);
}

module.exports = {
  getSmartFeaturedArtists,
  MUSIC_GENRES,
  MARKETS
};