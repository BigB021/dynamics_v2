import React, { useEffect, useState, useContext } from 'react';
import { Music2, Download } from 'lucide-react';
import TrackList from './TrackList';
import { PlayerContext } from '../context/PlayerContext';

const DownloadedTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentTrack, playTrack, setQueue } = useContext(PlayerContext);

  const handleDelete = (spotifyId) => {
    fetch(`http://localhost:3000/api/downloaded/${spotifyId}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete track');
        setTracks(prev => prev.filter(track => track.spotify_id !== spotifyId));
      })
      .catch(console.error);
  };

  const handlePlayTrack = (track) => {
    // Set the full tracks array as queue and play the selected track
    setQueue(tracks);
    playTrack(track, tracks);
  };


useEffect(() => {
  setLoading(true);
  fetch('http://localhost:3000/api/downloaded')
    .then(res => res.json())
    .then(data => {
      console.log('Raw tracks from API:', data);
      const parsed = data.map(track => ({
        ...track,
        id: `${track.filename}-${Date.now()}`,
        title: track.title || 'Unknown Title',
        artist: track.artist || 'Unknown Artist',
        cover: track.cover || '/default_cover.jpg',
        album: track.album || 'Downloaded',
        duration: typeof track.duration === 'string'
          ? parseDurationString(track.duration)
          : track.duration || 0,
      }));
      console.log('Parsed tracks:', parsed);
      setTracks(parsed);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
}, []);


  function parseDurationString(durationStr) {
    if (!durationStr || typeof durationStr !== 'string') return 0;
    const parts = durationStr.split(':').map(Number);
    if (parts.length === 2) {
      // mm:ss format
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      // hh:mm:ss format
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  }


  if (loading) {
    return (
      <div className="px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-6 md:py-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <Download className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Downloaded Music
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Your offline music library
        </p>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <Music2 className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
            No downloaded tracks yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Search and download songs to build your offline music library. 
            Downloaded tracks will appear here for easy access.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mb-20">
          <div className="p-6 mb-5">
            <TrackList
              tracks={tracks}
              title={`Downloaded Songs`}
              onDelete={handleDelete}
              onPlay={handlePlayTrack}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadedTracks;