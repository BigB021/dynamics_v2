const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const searchRoutes = require('./routes/search.js');
const downloadRoutes = require('./routes/download.js');
const downloadedRoutes = require('./routes/downloaded.js')
const playlistRoutes = require('./routes/playlists');
const albumRoutes = require('./routes/albums');
const favoriteRoutes = require('./routes/favorites');
const homeRoute = require('./routes/home');
const previewedAlbumsRoute = require('./routes/previewedAlbums.js');
const userStatsRoute = require('./routes/userStats');
const guestHomeRoute = require('./routes/guestHome');
const { router: authRoutes } = require('./routes/auth');




dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const FRONT_PORT = process.env.FRONT_PORT || 5173
const mediaDir = path.resolve(process.env.DOWNLOAD_DIR || './media');


app.use(cors({
  origin: `http://localhost:${FRONT_PORT}`,
}));

app.use(express.json());

app.use('/media', express.static(mediaDir));


app.use('/api/search', searchRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/downloaded', downloadedRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/home', homeRoute);
app.use('/api/preview/album', previewedAlbumsRoute);
app.use('/api/auth', authRoutes); 
app.use('/api/user/stats', userStatsRoute);
app.use('/api/guest-home', guestHomeRoute);



//app.use('/media', express.static(path.resolve(__dirname, 'media')));

app.listen(PORT, () => console.log(`🎵 Server running on http://localhost:${PORT}`));


app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});
