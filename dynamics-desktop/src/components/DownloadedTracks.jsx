import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import GlobalMusicPlayer from './GlobalMusicPlayer';
import { Music2 } from 'lucide-react';

const DownloadedTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/downloaded')
      .then(res => res.json())
      .then(data => {
        const parsed = data.map(track => ({
          ...track,
          id: `${track.filename}-${Date.now()}`,
          title: track.title || 'Unknown Title',
          artist: track.artist || 'Unknown Artist',
          cover: track.cover || '/default_cover.jpg', // fallback cover
        }));
        setTracks(parsed);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="px-6 py-8">
      <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-white flex gap-2">Downloaded Tracks <Music2 /></h2>

      {tracks.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <p className="text-lg">No downloaded tracks yet.</p>
          <p className="text-sm mt-2">Search and download songs to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map(track => (
            <div
              key={track.id}
              onClick={() => setCurrentTrack(track)}
              className="relative group bg-white dark:bg-zinc-900 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all"
            >
              {/* Cover */}
              <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
                <img
                  src={track.cover}
                  alt={`${track.title} cover`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition">
                  <div className="p-2 bg-blue-600 text-white rounded-full shadow-lg">
                    <Play size={20} />
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="p-4">
                <div className="text-lg font-semibold text-zinc-800 dark:text-white truncate">{track.title}</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{track.artist}</div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{track.filename}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <GlobalMusicPlayer
        currentTrack={currentTrack}
        onClose={() => setCurrentTrack(null)}
      />
    </div>
  );
};

export default DownloadedTracks;
