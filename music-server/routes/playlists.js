const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db,getPlaylistById,getAllPlaylists, createPlaylist,addTrackToPlaylist } = require('../db/db'); // ✅ Destructure the actual db instance

const router = express.Router();
const uploadDir = path.resolve(__dirname, '../media/playlist_covers');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

// Create playlist
router.post('/', upload.single('cover'), (req, res) => {
  const { name } = req.body;
  const cover = req.file ? `playlist_covers/${req.file.filename}` : null;

  try {
    // Just call the function — it already runs the statement and returns the result
    const result = createPlaylist(name, cover);

    const newPlaylist = { id: result.lastInsertRowid, name, cover };
    res.status(201).json(newPlaylist);
  } catch (err) {
    console.error('Failed to create playlist:', err);
    res.status(400).json({ error: 'Playlist name must be unique' });
  }
});

// POST /api/playlists/:playlistId/tracks
router.post('/:playlistId/tracks', (req, res) => {
  const { playlistId } = req.params;
  const { spotifyId } = req.body;

  try {
    const result = addTrackToPlaylist(playlistId, spotifyId);
    res.status(201).json({ message: 'Track added to playlist', result });
  } catch (err) {
    console.error('Failed to add track:', err);
    res.status(500).json({ error: 'Failed to add track to playlist' });
  }
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  try {
    let tracks = getPlaylistById(id);

    if (!Array.isArray(tracks) || tracks.length === 0) {
      return res.status(404).json({ error: 'Playlist not found or empty' });
    }

    // Map over tracks and add a 'filename' field extracted from absolute file_path
    tracks = tracks.map(track => {
      const filename = path.basename(track.file_path); // e.g. "Offset - Bodies.mp3"
      return {
        ...track,
        filename,        // Add this for frontend
        // optionally you can also add a url property here if you want:
        url: `/media/${filename}`
      };
    });

    res.json(tracks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve playlist' });
  }
});

router.get('/', (req, res) => {
  try {
    const playlists = getAllPlaylists();
    res.json(playlists);
  } catch (err) {
    console.error('[GET /api/playlists] error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  try {
    const stmt = db.prepare('DELETE FROM playlists WHERE id = ?');
    stmt.run(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete playlist:', err);
    res.status(500).json({ error: 'Failed to delete' });
  }
});



module.exports = router;
