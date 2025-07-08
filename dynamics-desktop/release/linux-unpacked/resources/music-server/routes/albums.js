const express = require('express');
const path = require('path');
const fs = require('fs');
const { parseFile } = require('music-metadata');
const { getAllAlbums, getAlbumAndTracksBySpotifyId, deleteAlbumBySpotifyId, db } = require('../db/db');
const { authenticateToken } = require('./auth');


const router = express.Router();
const mediaBaseUrl = 'http://localhost:3000/media/';

router.use(authenticateToken);

// GET /api/albums — list all albums
router.get('/', (req, res) => {
  try {
    //const albums = getAllAlbums(req.userId).filter(a => a.spotify_id);
    const albums = getAllAlbums(req.userId);
    const formatted = albums.map((album) => ({
      id: album.spotify_id,         
      name: album.name,
      artist: album.artist,
      release_date: album.release_date,
      cover: album.cover ? mediaBaseUrl + encodeURIComponent(album.cover) : null,
    }));
    res.json(formatted);
  } catch (err) {
    console.error('❌ Error fetching albums:', err);
    res.status(500).json({ error: 'Failed to get albums' });
  }
});

// GET /api/albums/:spotify_id — get album and tracks by spotify_id
router.get('/:spotify_id', async (req, res) => {
  const spotifyId = req.params.spotify_id;

  try {
    const result = getAlbumAndTracksBySpotifyId(req.userId,spotifyId);
    if (!result) return res.status(404).json({ error: 'Album not found' });

    const { album, tracks } = result;

    // Enrich tracks with duration if missing
    const enrichedTracks = await Promise.all(tracks.map(async (track) => {
      if (track.duration === null || track.duration === undefined) {
        if (fs.existsSync(track.file_path)) {
          try {
            const metadata = await parseFile(track.file_path);
            const duration = Math.round(metadata.format.duration || 0);
            db.prepare('UPDATE downloads SET duration = ? WHERE spotify_id = ?').run(duration, track.spotify_id);
            track.duration = duration;
          } catch (err) {
            console.warn(`Failed to parse duration for track ${track.spotify_id}:`, err);
          }
        }
      }

      return {
        spotify_id: track.spotify_id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        release_date: track.release_date,
        url: mediaBaseUrl + encodeURIComponent(path.basename(track.file_path)),
        cover: track.cover ? mediaBaseUrl + encodeURIComponent(track.cover) : null,
        duration: track.duration || 0,
      };
    }));

    res.json({
      album: {
        id: album.spotify_id,
        name: album.name,
        artist: album.artist,
        release_date: album.release_date,
        cover: album.cover ? mediaBaseUrl + encodeURIComponent(album.cover) : null,
      },
      tracks: enrichedTracks,
    });
    console.log("album id: "+album.id )
  } catch (err) {
    console.error('❌ Error fetching album tracks:', err);
    res.status(500).json({ error: 'Failed to fetch album tracks' });
  }
});


// DELETE /api/albums/:spotify_id
router.delete('/:spotify_id', (req, res) => {
  const spotifyId = req.params.spotify_id;

  try {
    deleteAlbumBySpotifyId(req.userId,spotifyId);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error deleting album:', err);
    res.status(500).json({ error: 'Failed to delete album' });
  }
});


module.exports = router;
