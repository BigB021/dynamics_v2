import { useEffect, useState, useContext } from 'react';
import { Heart, Play } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';
import TrackList from '../components/TrackList';

export default function Favorites() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, setQueue } = useContext(PlayerContext);

  useEffect(() => {
    setLoading(true);
    fetch('/api/favorites')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch favorites');
        return res.json();
      })
      .then(setTracks)
      .catch(err => {
        console.error('Failed to fetch favorites:', err);
        setTracks([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (spotifyId) => {
    fetch(`/api/favorites/${spotifyId}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (res.ok) {
          setTracks(prev => prev.filter(track => track.spotify_id !== spotifyId));
        } else {
          throw new Error('Failed to delete');
        }
      })
      .catch(err => console.error('Error deleting favorite:', err));
  };

  const handlePlay = (track) => {
    if (!track.url && track.filename) {
      track.url = `http://localhost:3000/media/${track.filename}`;
    }
    setQueue(tracks);
    playTrack(track, tracks);
  };

  const getTotalDuration = () => {
    const totalSeconds = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-end gap-6 mb-6">
            <div className="relative group">
              <div className="w-48 h-48 bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <Heart className="w-24 h-24 text-white" fill="currentColor" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-pink-500/20 to-purple-600/20 rounded-2xl blur-xl -z-10 group-hover:blur-2xl transition-all duration-300"></div>
            </div>

            <div className="flex-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Playlist
              </span>
              <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Liked Songs
              </h1>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span className="font-medium">{tracks.length} songs</span>
                {tracks.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{getTotalDuration()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {tracks.length > 0 && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => handlePlay(tracks[0])}
                className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                Play All
              </button>
            </div>
          )}
        </div>

        {tracks.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            You have no liked songs yet.
          </div>
        ) : (
          <TrackList
            tracks={tracks}
            onDelete={handleDelete}
            onPlay={handlePlay}
            title="Liked Songs"
          />
        )}
      </div>
    </div>
  );
}
