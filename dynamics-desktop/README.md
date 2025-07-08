
# 🎵 Dynamics Desktop

> A cross-platform, Spotify-powered music streaming and downloading app.
> Built with React, Electron, and SpotDL. (Build just for linux currently)

---

## 📦 Features

- 🔎 Search Spotify tracks, albums, and playlists
- 🎧 Stream and download music locally in `MP3` format (192kbps)
- 💾 Offline support with metadata (artist, album, cover)
- 📚 Favorites, playlists, user stats
- 🌙 Dark/light mode with elegant UI
- 🧠 Uses `SpotDL` under the hood for music downloads

---

## 🖥️ Tech Stack

| Layer     | Stack                                                              |
| --------- | ------------------------------------------------------------------ |
| Frontend  | React + Vite + TailwindCSS                                         |
| Backend   | Node.js + Express + SQLite                                         |
| Electron  | Desktop shell for Linux & Windows                                  |
| Downloads | [SpotDL](https://github.com/spotDL/spotify-downloader) in Python venv |
| Database  | SQLite (`downloads.db`)                                          |

---

## 🛠️ Prerequisites

Before building and running the app:

### 1. Install system dependencies:

```bash
sudo apt install nodejs npm python3 python3-venv
```
### 2. Clone the repository
```bash
cd ~
git clone https://github.com/BigB021/dynamics-desktop.git
cd dynamics-desktop
```
### 3. Create dynamics workspace directory
```bash
mkdir -p ~/dynamics/media
```
###  4. Install SpotDL in Python venv 
1. Navigate to your home directory ex home/your-username
```bash
cd dynamics
python3 -m venv venv
source venv/bin/activate
pip install spotdl
deactivate
cd ..
```

## 🚀 Build for Linux

```bash
./build.sh
```

### This will:
- Clean previous builds
- Install backend dependencies
- Build frontend via Vite
- Package the app via electron-builder
- Generate a .AppImage in release/

### Output:

release/Dynamics-0.1.0.AppImage
- Double-click or run it via:

```bash
./release/Dynamics-0.1.0.AppImage
```

## 💻 Run in Dev Mode (3 terminals)

1. Backend:
```bash
npm run dev
```
2. Frontend (Vite):
```bash
npm start
```
3. Electron desktop app:
```bash
ELECTRON_DEV=true npx electron .
```

## 🧪 Debug Tips
Logs in console show SpotDL progress and backend calls.

If download fails: ensure your Spotify credentials are valid and SpotDL works manually.

Check the downloaded MP3s inside ~/dynamics/media.

## 🤝 Contributing
Pull requests are welcome! Please fork the repo and submit a PR.