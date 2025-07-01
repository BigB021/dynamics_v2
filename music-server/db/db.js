const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, 'downloads.db'));

// Initialize table
// Now includes cover, album, duration, and release_date

const init = db.prepare(`
  CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spotify_id TEXT UNIQUE NOT NULL,
    file_path TEXT NOT NULL,
    status TEXT NOT NULL, -- "downloaded", "error"
    artist TEXT,
    title TEXT,
    album TEXT,
    duration INTEGER, -- duration in seconds
    release_date TEXT,
    cover TEXT, -- URL or path to album art
    downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();



function addDownload(spotifyId, filePath, status, artist = null, title = null, album = null, duration = null, releaseDate = null, cover = null) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO downloads (spotify_id, file_path, status, artist, title, album, duration, release_date, cover)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(spotifyId, filePath, status, artist, title, album, duration, releaseDate, cover);
}

function getDownloadBySpotifyId(spotifyId) {
  return db.prepare('SELECT * FROM downloads WHERE spotify_id = ?').get(spotifyId);
}

function deleteDownloadBySpotifyId(spotifyId) {
  const stmt = db.prepare('DELETE FROM downloads WHERE spotify_id = ?');
  stmt.run(spotifyId);
}

function getAllDownloads() {
  return db.prepare('SELECT * FROM downloads WHERE status = ?').all('downloaded');
}


module.exports = {
  getDownloadBySpotifyId,
  addDownload,
  deleteDownloadBySpotifyId,
  getAllDownloads,
};
