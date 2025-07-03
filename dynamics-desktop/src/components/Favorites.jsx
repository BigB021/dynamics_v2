import { useEffect, useState, useContext } from 'react';
import { Heart } from 'lucide-react';
import TrackList from '../components/TrackList';
import { PlayerContext } from '../context/PlayerContext';

export default function Favorites() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, setQueue } = useContext(PlayerContext);

  // Fetch favorites from backend
  useEffect(() => {
    setLoading(true);
    fetch('/api/favorites')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch favorites');
        return res.json();
      })
      .then(data => {
        console.log('Fetched favorites:', data); // Debug log
        setTracks(data);
      })
      .catch(err => {
        console.error('Failed to fetch favorites:', err);
        setTracks([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Remove track from favorites and update list
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

  // Play selected track and set full favorites list as queue
  const handlePlay = (track) => {
    console.log('Playing track:', track); // Debug log
    console.log('Track URL:', track.url); // Debug the URL specifically
    
    // Ensure the track has the correct URL field (not audio_url)
    if (!track.url && track.filename) {
      track.url = `http://localhost:3000/media/${track.filename}`;
    }
    
    // Set the full favorites list as queue and play the selected track
    setQueue(tracks);
    playTrack(track, tracks);
  };

  if (loading) {
    return (
      <div className="px-4 md:px-6 py-6 md:py-8 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
            <Heart className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Liked Songs
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Your favorite tracks in one place
        </p>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <Heart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
            No liked songs yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Like songs by clicking the heart icon to see them here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6">
            <TrackList
              tracks={tracks}
              title={`Liked Songs (${tracks.length})`}
              onDelete={handleDelete}
              onPlay={handlePlay}
            />
          </div>
        </div>
      )}
    </div>
  );
}