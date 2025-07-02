import React, { useEffect, useState, useContext } from 'react';
import { Music2 } from 'lucide-react';
import TrackCard from './TrackCard';
import { PlayerContext } from '../context/PlayerContext';

const DownloadedTracks = () => {
  const [tracks, setTracks] = useState([]);
  const { currentTrack, setCurrentTrack } = useContext(PlayerContext);

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

  useEffect(() => {
    fetch('http://localhost:3000/api/downloaded')
      .then(res => res.json())
      .then(data => {
        const parsed = data.map(track => ({
          ...track,
          id: `${track.filename}-${Date.now()}`,
          title: track.title || 'Unknown Title',
          artist: track.artist || 'Unknown Artist',
          cover: track.cover || '/default_cover.jpg',
        }));
        setTracks(parsed);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="px-6 py-8">
      <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-white flex gap-2">
        Downloaded Tracks <Music2 />
      </h2>

      {tracks.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <p className="text-lg">No downloaded tracks yet.</p>
          <p className="text-sm mt-2">Search and download songs to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map(track => (
            <TrackCard
              key={track.id}
              track={track}
              onDelete={handleDelete}
              onPlay={() => setCurrentTrack(track)}
              isPlaying={currentTrack?.spotify_id === track.spotify_id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DownloadedTracks;
