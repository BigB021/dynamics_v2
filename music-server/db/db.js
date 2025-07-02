const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, 'downloads.db'));

// Initialize `downloads` table (already present in your code)
db.prepare(`
  CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spotify_id TEXT UNIQUE NOT NULL,
    file_path TEXT NOT NULL,
    status TEXT NOT NULL,
    artist TEXT,
    title TEXT,
    album TEXT,
    duration INTEGER,
    release_date TEXT,
    cover TEXT,
    downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Initialize `playlists` table
db.prepare(`
  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    cover TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Initialize `playlist_tracks` relation table
db.prepare(`
  CREATE TABLE IF NOT EXISTS playlist_tracks (
    playlist_id INTEGER NOT NULL,
    spotify_id TEXT NOT NULL,
    PRIMARY KEY (playlist_id, spotify_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
    FOREIGN KEY (spotify_id) REFERENCES downloads(spotify_id)
  )
`).run();

// Export both the DB instance and the helper methods
module.exports = {
  db, 
  addDownload(spotifyId, filePath, status, artist = null, title = null, album = null, duration = null, releaseDate = null, cover = null) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO downloads (spotify_id, file_path, status, artist, title, album, duration, release_date, cover)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(spotifyId, filePath, status, artist, title, album, duration, releaseDate, cover);
  },

  getDownloadBySpotifyId(spotifyId) {
    return db.prepare('SELECT * FROM downloads WHERE spotify_id = ?').get(spotifyId);
  },

  deleteDownloadBySpotifyId(spotifyId) {
    return db.prepare('DELETE FROM downloads WHERE spotify_id = ?').run(spotifyId);
  },

  getAllDownloads() {
    return db.prepare('SELECT * FROM downloads WHERE status = ?').all('downloaded');
  },

  createPlaylist(name, cover = null) {
    return db.prepare('INSERT INTO playlists (name, cover) VALUES (?, ?)').run(name, cover);
  },

  getAllPlaylists() {
    return db.prepare('SELECT * FROM playlists ORDER BY created_at DESC').all();
  },

  getPlaylistById(id) {
    return db.prepare(`
      SELECT d.* FROM playlist_tracks pt
      JOIN downloads d ON pt.spotify_id = d.spotify_id
      WHERE pt.playlist_id = ?
    `).all(id);
  },

  addTrackToPlaylist(playlistId, spotifyId) {
    return db.prepare('INSERT OR IGNORE INTO playlist_tracks (playlist_id, spotify_id) VALUES (?, ?)').run(playlistId, spotifyId);
  },

  removeTrackFromPlaylist(playlistId, spotifyId) {
    return db.prepare('DELETE FROM playlist_tracks WHERE playlist_id = ? AND spotify_id = ?').run(playlistId, spotifyId);
  }
};
