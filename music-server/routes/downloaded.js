const express = require('express');
const path = require('path');
const fs = require('fs');
const {getDownloadBySpotifyId,deleteDownloadBySpotifyId, getAllDownloads} = require('../db/db');

const router = express.Router();
const mediaBaseUrl = 'http://localhost:3000/media/';
const mediaBaseDir = path.resolve(__dirname, '..', 'media');


router.get('/', (req, res) => {
  try {
    // Fetch all downloaded tracks from DB
    const downloads = getAllDownloads();

    const tracks = downloads.map(track => ({
      spotify_id:track.spotify_id,
      filename: path.basename(track.file_path),
      url: mediaBaseUrl + encodeURIComponent(path.basename(track.file_path)),
      artist: track.artist || 'Unknown Artist',
      title: track.title || 'Unknown Title',
      cover: track.cover ? mediaBaseUrl + encodeURIComponent(track.cover) : '/default_cover.jpeg'
    }));

    res.json(tracks);
  } catch (err) {
    console.error('Error fetching downloaded tracks:', err);
    res.status(500).json({ error: 'Failed to get downloaded tracks' });
  }
});

router.delete('/:spotifyId', (req, res) => {
  const { spotifyId } = req.params;
  try {
    const track = getDownloadBySpotifyId(spotifyId);
    console.log("deleting track id "+spotifyId)
    if (!track) return res.status(404).json({ error: 'Track not found' });

    // Delete audio file
    if (track.file_path && fs.existsSync(track.file_path)) {
      fs.unlinkSync(track.file_path);
    }

    // Delete cover if it's a local file
    if (track.cover && !track.cover.startsWith('http')) {
      const coverPath = path.resolve(mediaBaseDir, track.cover);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    deleteDownloadBySpotifyId(spotifyId);
    res.status(200).json({ message: 'Track deleted successfully' });
  } catch (err) {
    console.error('Error deleting track:', err);
    res.status(500).json({ error: 'Failed to delete track' });
  }
});


module.exports = router;
