const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, 'downloads.db'));

// Downloads table (tracks)
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

// Albums table
db.prepare(`
  CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    artist TEXT,
    cover TEXT,
    release_date TEXT,
    UNIQUE(name, artist)
  )
`).run();

// Playlists table
db.prepare(`
  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    cover TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Playlist ↔ Track relation table
db.prepare(`
  CREATE TABLE IF NOT EXISTS playlist_tracks (
    playlist_id INTEGER NOT NULL,
    spotify_id TEXT NOT NULL,
    PRIMARY KEY (playlist_id, spotify_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
    FOREIGN KEY (spotify_id) REFERENCES downloads(spotify_id)
  )
`).run();

// Favorites table
db.prepare(`
  CREATE TABLE IF NOT EXISTS favorites (
    spotify_id TEXT PRIMARY KEY,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spotify_id) REFERENCES downloads(spotify_id) ON DELETE CASCADE
  )
`).run();

module.exports = {
  db,

  // === TRACKS ===
  addDownload(spotifyId, filePath, status, artist = null, title = null, album = null, duration = null, releaseDate = null, cover = null) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO downloads 
        (spotify_id, file_path, status, artist, title, album, duration, release_date, cover)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(spotifyId, filePath, status, artist, title, album, duration, releaseDate, cover);
  },

  getDownloadBySpotifyId(spotifyId) {
    return db.prepare('SELECT * FROM downloads WHERE spotify_id = ?').get(spotifyId);
  },

  deleteDownloadBySpotifyId(spotifyId) {
    const deleteFav = db.prepare('DELETE FROM favorites WHERE spotify_id = ?');
    deleteFav.run(spotifyId);

    return db.prepare('DELETE FROM downloads WHERE spotify_id = ?').run(spotifyId);
  },

  getAllDownloads() {
    return db.prepare('SELECT * FROM downloads WHERE status = ?').all('downloaded');
  },

  getDownloadsByAlbum(albumName) {
    return db.prepare(`
      SELECT * FROM downloads 
      WHERE album = ?
      ORDER BY release_date DESC
    `).all(albumName);
  },

  // === ALBUMS ===
  addAlbum(name, artist = null, cover = null, releaseDate = null) {
    const existing = db.prepare(`
      SELECT id FROM albums WHERE name = ? AND artist IS ?
    `).get(name, artist);

    if (existing) return existing.id;

    const result = db.prepare(`
      INSERT INTO albums (name, artist, cover, release_date)
      VALUES (?, ?, ?, ?)
    `).run(name, artist, cover, releaseDate);

    return result.lastInsertRowid;
  },

  getAlbumByName(name) {
    return db.prepare(`SELECT * FROM albums WHERE name = ?`).get(name);
  },

  getAllAlbums() {
    return db.prepare(`
      SELECT
        album AS name,
        artist,
        MIN(release_date) AS release_date,
        (
          SELECT cover
          FROM downloads AS d2
          WHERE d2.album = d1.album AND d2.cover IS NOT NULL
          LIMIT 1
        ) AS cover
      FROM downloads AS d1
      WHERE album IS NOT NULL AND status = 'downloaded'
      GROUP BY album, artist
      ORDER BY MAX(downloaded_at) DESC
    `).all();
  },

  getTracksByAlbum(albumName) {
    return db.prepare(`
      SELECT * FROM downloads
      WHERE album = ?
      ORDER BY downloaded_at ASC
    `).all(albumName);
  },
  // === PLAYLISTS ===
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
    return db.prepare(`
      INSERT OR IGNORE INTO playlist_tracks (playlist_id, spotify_id)
      VALUES (?, ?)
    `).run(playlistId, spotifyId);
  },

  removeTrackFromPlaylist(playlistId, spotifyId) {
    return db.prepare(`
      DELETE FROM playlist_tracks 
      WHERE playlist_id = ? AND spotify_id = ?
    `).run(playlistId, spotifyId);
  },
  // === FAVORITES ===
  addFavorite(spotifyId) {
    return db.prepare('INSERT OR IGNORE INTO favorites (spotify_id) VALUES (?)').run(spotifyId);
  },

  removeFavorite(spotifyId) {
    return db.prepare('DELETE FROM favorites WHERE spotify_id = ?').run(spotifyId);
  },

  isFavorite(spotifyId) {
    return db.prepare('SELECT 1 FROM favorites WHERE spotify_id = ?').get(spotifyId);
  },

  getAllFavorites() {
    return db.prepare(`
      SELECT 
        d.*,
        f.added_at as favorited_at
      FROM favorites f
      JOIN downloads d ON d.spotify_id = f.spotify_id
      WHERE d.status = 'downloaded'
      ORDER BY f.added_at DESC
    `).all();
  },

  // Fetch Artists

};
