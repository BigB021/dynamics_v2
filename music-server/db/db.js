const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, 'downloads.db'));

// Initialize table
db.prepare(`
  CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spotify_id TEXT UNIQUE NOT NULL,
    file_path TEXT NOT NULL,
    status TEXT NOT NULL, -- "downloaded", "error"
    artist TEXT,
    title TEXT,
    downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();


function getDownloadBySpotifyId(spotifyId) {
  return db.prepare('SELECT * FROM downloads WHERE spotify_id = ?').get(spotifyId);
}

function addDownload(spotifyId, filePath, status, artist = null, title = null) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO downloads (spotify_id, file_path, status, artist, title)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(spotifyId, filePath, status, artist, title);
}


function deleteDownloadBySpotifyId(spotifyId) {
  const stmt = db.prepare('DELETE FROM downloads WHERE spotify_id = ?');
  stmt.run(spotifyId);
}


module.exports = {
  getDownloadBySpotifyId,
  addDownload,
  deleteDownloadBySpotifyId,
};
