import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import DownloadedTracks from './components/DownloadedTracks';
import Header from './components/Header';
import GlobalMusicPlayer from './components/GlobalMusicPlayer';
import PlaylistPage from './components/PlaylistPage';
import PlaylistDetail from './components/PlaylistDetail';

function App() {
  const [query, setQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-100 dark:from-zinc-900 dark:via-zinc-900 dark:to-indigo-950 text-neutral-900 dark:text-white">
      <Header query={query} setQuery={setQuery} />

      <Routes>
        <Route
          path="/"
          element={<SearchBar query={query} setQuery={setQuery} />}
        />
        <Route path="/downloads" element={<DownloadedTracks />} />
        <Route path="/playlists" element={<PlaylistPage />} />
        <Route path="/playlist/:id" element={<PlaylistDetail />} />
      </Routes>

      <GlobalMusicPlayer />
    </div>
  );
}

export default App;
