const express = require('express');
const path = require('path');
const fs = require('fs');
const { parseFile } = require('music-metadata');
const { getAllAlbums, getTracksByAlbum, db } = require('../db/db');

const router = express.Router();
const mediaBaseUrl = 'http://localhost:3000/media/';

// GET /api/albums — list all albums
router.get('/', (req, res) => {
  try {
    const albums = getAllAlbums();
    const formatted = albums.map((album) => ({
      id: album.id,
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

// GET /api/albums/:name — get all tracks of a specific album
router.get('/:name', async (req, res) => {
  const albumName = req.params.name;

  try {
    const tracks = getTracksByAlbum(albumName);

    // For each track, check duration, parse file if missing, update DB
    const enrichedTracks = await Promise.all(tracks.map(async (track) => {
      if (track.duration === null || track.duration === undefined) {
        if (fs.existsSync(track.file_path)) {
          try {
            const metadata = await parseFile(track.file_path);
            const duration = Math.round(metadata.format.duration || 0);
            // Update duration in DB
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

    res.json(enrichedTracks);
  } catch (err) {
    console.error('❌ Error fetching album tracks:', err);
    res.status(500).json({ error: 'Failed to fetch album tracks' });
  }
});

module.exports = router;
