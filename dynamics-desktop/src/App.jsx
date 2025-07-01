import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import SearchBar from "./components/SearchBar";
import DownloadedTracks from "./components/DownloadedTracks";
import Header from "./components/Header";
import GlobalMusicPlayer from "./components/GlobalMusicPlayer";

function App() {
  const [query, setQuery] = useState('');
  const [currentTrack, setCurrentTrack] = useState(null);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white">
      <Header query={query} setQuery={setQuery} />
      
      <Routes>
        <Route
          path="/"
          element={
            <SearchBar
              query={query}
              setQuery={setQuery}
              setCurrentTrack={setCurrentTrack}
            />
          }
        />
        <Route path="/downloads" element={<DownloadedTracks setCurrentTrack={setCurrentTrack} />} />
      </Routes>

      <GlobalMusicPlayer
        currentTrack={currentTrack}
        onClose={() => setCurrentTrack(null)}
      />

      {/* <DownloadedTracks/> */}
    </div>
  );
}

export default App;
