const express = require('express');
const dotenv = require('dotenv');
const searchRoutes = require('./routes/search.js');
const downloadRoutes = require('./routes/download.js');
const downloadedRoutes = require('./routes/downloaded.js')
const cors = require('cors');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:3001',
}));

app.use(express.json());
app.use('/api/search', searchRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/downloaded', downloadedRoutes);

app.use('/media', express.static(process.env.DOWNLOAD_DIR || './media'));

app.listen(PORT, () => console.log(`🎵 Server running on http://localhost:${PORT}`));
