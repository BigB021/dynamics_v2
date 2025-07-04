const Database = require('better-sqlite3');
const path = require('path');
const fs = require("fs");

const db = new Database(path.resolve(__dirname, 'downloads.db'));
db.pragma('foreign_keys = ON');

// === USERS ===
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    profile_picture TEXT
  )
`).run();

// === DOWNLOADS ===
db.prepare(`
  CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    spotify_id TEXT NOT NULL UNIQUE,
    file_path TEXT NOT NULL,
    status TEXT NOT NULL,
    artist TEXT,
    title TEXT,
    album TEXT,
    duration INTEGER,
    release_date TEXT,
    cover TEXT,
    downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, spotify_id)
  )
`).run();

// === ALBUMS ===
db.prepare(`
  CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spotify_id TEXT UNIQUE,
    name TEXT NOT NULL,
    artist TEXT,
    cover TEXT,
    release_date TEXT,
    UNIQUE(name, artist)
  )
`).run();

// === PLAYLISTS ===
db.prepare(`
  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    cover TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
  )
`).run();

// === PLAYLIST TRACKS ===
db.prepare(`
  CREATE TABLE IF NOT EXISTS playlist_tracks (
    playlist_id INTEGER NOT NULL,
    spotify_id TEXT NOT NULL,
    PRIMARY KEY (playlist_id, spotify_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
    FOREIGN KEY (spotify_id) REFERENCES downloads(spotify_id)
  )
`).run();

// === FAVORITES ===
db.prepare(`
  CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL REFERENCES users(id),
    spotify_id TEXT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, spotify_id),
    FOREIGN KEY (spotify_id) REFERENCES downloads(spotify_id) ON DELETE CASCADE
  )
`).run();

module.exports = {
  db,

  // === USERS ===
  createUser(username, email, passwordHash) {
    return db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, passwordHash);
  },

  getUserByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },

  getUserById(userId) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  },

  updateUsername(userId, newUsername) {
    return db.prepare(`UPDATE users SET username = ? WHERE id = ?`).run(newUsername, userId);
  },

  updateProfilePicture(userId, picturePath) {
    return db.prepare(`UPDATE users SET profile_picture = ? WHERE id = ?`).run(picturePath, userId);
  },

  // === TRACKS ===
  addDownload(userId, spotifyId, filePath, status, artist = null, title = null, album = null, duration = null, releaseDate = null, cover = null) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO downloads 
        (user_id, spotify_id, file_path, status, artist, title, album, duration, release_date, cover)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(userId, spotifyId, filePath, status, artist, title, album, duration, releaseDate, cover);
  },

  getDownloadBySpotifyId(userId, spotifyId) {
    return db.prepare('SELECT * FROM downloads WHERE user_id = ? AND spotify_id = ?').get(userId, spotifyId);
  },

  deleteDownloadBySpotifyId(userId, spotifyId) {
    // Delete references in favorites (already done)
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND spotify_id = ?').run(userId, spotifyId);

    // Delete references in playlist_tracks
    db.prepare('DELETE FROM playlist_tracks WHERE spotify_id = ?').run(spotifyId);

    // Now delete from downloads
    return db.prepare('DELETE FROM downloads WHERE user_id = ? AND spotify_id = ?').run(userId, spotifyId);
  },

  getAllDownloads(userId) {
    return db.prepare('SELECT * FROM downloads WHERE user_id = ? AND status = ?').all(userId, 'downloaded');
  },

  getDownloadsByAlbum(userId, albumName) {
    return db.prepare(`
      SELECT * FROM downloads 
      WHERE user_id = ? AND album = ?
      ORDER BY release_date DESC
    `).all(userId, albumName);
  },

  // === ALBUMS ===
  addAlbum(name, artist = null, cover = null, releaseDate = null, spotifyId = null) {
    const existing = db.prepare(`
      SELECT id FROM albums WHERE name = ? AND (artist = ? OR (artist IS NULL AND ? IS NULL))
    `).get(name, artist, artist);

    if (existing) return existing.id;

    const result = db.prepare(`
      INSERT INTO albums (spotify_id, name, artist, cover, release_date)
      VALUES (?, ?, ?, ?, ?)
    `).run(spotifyId, name, artist, cover, releaseDate);

    return result.lastInsertRowid;
  },

  getAlbumByName(name) {
    return db.prepare(`SELECT * FROM albums WHERE name = ?`).get(name);
  },

  getAllAlbums() {
    return db.prepare(`
      SELECT spotify_id, name, artist, cover, release_date
      FROM albums
      ORDER BY id DESC
    `).all();
  },

  getAlbumBySpotifyId(spotifyId) {
    return db.prepare(`SELECT * FROM albums WHERE spotify_id = ?`).get(spotifyId);
  },

  getTracksByAlbum(userId, albumName) {
    return db.prepare(`
      SELECT * FROM downloads
      WHERE user_id = ? AND album = ?
      ORDER BY downloaded_at ASC
    `).all(userId, albumName);
  },

  deleteAlbumBySpotifyId(userId, spotifyId) {
    const album = module.exports.getAlbumBySpotifyId(spotifyId);
    if (!album) return;

    const tracks = module.exports.getTracksByAlbum(userId, album.name);

    for (const track of tracks) {
      if (track.file_path && fs.existsSync(track.file_path)) {
        try {
          fs.unlinkSync(track.file_path);
        } catch (err) {
          console.warn(`Failed to delete file ${track.file_path}:`, err);
        }
      }

      db.prepare(`DELETE FROM favorites WHERE user_id = ? AND spotify_id = ?`).run(userId, track.spotify_id);
      db.prepare(`DELETE FROM playlist_tracks WHERE spotify_id = ?`).run(track.spotify_id);
      db.prepare(`DELETE FROM downloads WHERE user_id = ? AND spotify_id = ?`).run(userId, track.spotify_id);
    }

    if (album.cover) {
      const coverPath = path.resolve(__dirname, "../media", album.cover);
      if (fs.existsSync(coverPath)) {
        try {
          fs.unlinkSync(coverPath);
        } catch (err) {
          console.warn(`Failed to delete cover ${coverPath}:`, err);
        }
      }
    }

    return db.prepare(`DELETE FROM albums WHERE spotify_id = ?`).run(spotifyId);
  },

  getAlbumAndTracksBySpotifyId(userId, spotifyId) {
    const album = module.exports.getAlbumBySpotifyId(spotifyId);
    if (!album) return null;
    const tracks = module.exports.getTracksByAlbum(userId, album.name);
    return { album, tracks };
  },

  // === PLAYLISTS ===
  createPlaylist(userId, name, cover = null) {
    return db.prepare('INSERT INTO playlists (user_id, name, cover) VALUES (?, ?, ?)').run(userId, name, cover);
  },

  getAllPlaylists(userId) {
    return db.prepare('SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  },

  getPlaylistById(userId, playlistId) {
    return db.prepare(`
      SELECT d.* FROM playlist_tracks pt
      JOIN downloads d ON pt.spotify_id = d.spotify_id
      JOIN playlists p ON pt.playlist_id = p.id
      WHERE pt.playlist_id = ? AND p.user_id = ?
    `).all(playlistId, userId);
  },

  addTrackToPlaylist(playlistId, spotifyId) {
    return db.prepare('INSERT OR IGNORE INTO playlist_tracks (playlist_id, spotify_id) VALUES (?, ?)').run(playlistId, spotifyId);
  },

  removeTrackFromPlaylist(playlistId, spotifyId) {
    return db.prepare('DELETE FROM playlist_tracks WHERE playlist_id = ? AND spotify_id = ?').run(playlistId, spotifyId);
  },

  // === FAVORITES ===
  addFavorite(userId, spotifyId) {
    return db.prepare('INSERT OR IGNORE INTO favorites (user_id, spotify_id) VALUES (?, ?)').run(userId, spotifyId);
  },

  removeFavorite(userId, spotifyId) {
    return db.prepare('DELETE FROM favorites WHERE user_id = ? AND spotify_id = ?').run(userId, spotifyId);
  },

  isFavorite(userId, spotifyId) {
    return db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND spotify_id = ?').get(userId, spotifyId);
  },

  getAllFavorites(userId) {
    return db.prepare(`
      SELECT d.*, f.added_at as favorited_at
      FROM favorites f
      JOIN downloads d ON d.spotify_id = f.spotify_id AND d.user_id = f.user_id
      WHERE f.user_id = ? AND d.status = 'downloaded'
      ORDER BY f.added_at DESC
    `).all(userId);
  },
};
