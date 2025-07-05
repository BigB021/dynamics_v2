import React, { useState, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import DownloadedTracks from './components/DownloadedTracks';
import Header from './components/Header';
import GlobalMusicPlayer from './components/GlobalMusicPlayer';
import PlaylistPage from './components/PlaylistPage';
import PlaylistDetail from './components/PlaylistDetail';
import DownloadedAlbums from './components/DownloadedAlbums';
import AlbumPage from './components/AlbumPage';
import Favorites from './components/Favorites';
import HomePage from './components/HomePage';
import AlbumPreviewPage from './components/AlbumPreviewPage';
import Login from './components/Login';
import Register from './components/Rgister';
import { AuthContext } from './context/AuthContext';
import Profile from './components/Profile';
import Layout from './components/Layout';
import HomeWrapper from './components/HomeWrapper';

function App() {
  const [query, setQuery] = useState('');
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-100 dark:from-zinc-900 dark:via-zinc-900 dark:to-indigo-950 text-neutral-900 dark:text-white">
      <div className="flex-1">
        <Layout>
          <Header query={query} setQuery={setQuery} />
          <Routes>
            <Route path="/" element={<HomeWrapper />} />
            <Route path="/downloads" element={<DownloadedTracks />} />
            <Route path="/playlists" element={<PlaylistPage />} />
            <Route path="/playlist/:id" element={<PlaylistDetail />} />
            <Route path="/albums" element={<DownloadedAlbums />} />
            <Route path="/albums/:spotify_id" element={<AlbumPage />} />
            <Route path="/album/:spotify_id" element={<AlbumPreviewPage />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>

        <GlobalMusicPlayer />
      </div>
    </div>
  );
}


export default App;
