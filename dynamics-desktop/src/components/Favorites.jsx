import { useEffect, useState, useContext } from 'react';
import { Heart, Play, Pause, Music, Clock, Trash2 } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';

export default function Favorites() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTrack, setHoveredTrack] = useState(null);
  const { playTrack, setQueue, currentTrack, isPlaying } = useContext(PlayerContext);

  // Fetch favorites from backend
  useEffect(() => {
    setLoading(true);
    fetch('/api/favorites')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch favorites');
        return res.json();
      })
      .then(data => {
        console.log('Fetched favorites:', data);
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
    console.log('Playing track:', track);
    console.log('Track URL:', track.url);
    
    // Ensure the track has the correct URL field
    if (!track.url && track.filename) {
      track.url = `http://localhost:3000/media/${track.filename}`;
    }
    
    // Set the full favorites list as queue and play the selected track
    setQueue(tracks);
    playTrack(track, tracks);
  };

  // Format duration from seconds to mm:ss
  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get total duration of all tracks
  const getTotalDuration = () => {
    const totalSeconds = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="mb-8">
              <div className="flex items-end gap-6 mb-6">
                <div className="w-48 h-48 bg-gradient-to-br from-red-200 to-pink-200 dark:from-red-800 dark:to-pink-800 rounded-2xl shadow-xl"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-80"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                </div>
              </div>
            </div>
            
            {/* Track list skeleton */}
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-end gap-6 mb-6">
            {/* Liked Songs Artwork */}
            <div className="relative group">
              <div className="w-48 h-48 bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <Heart className="w-24 h-24 text-white" fill="currentColor" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-pink-500/20 to-purple-600/20 rounded-2xl blur-xl -z-10 group-hover:blur-2xl transition-all duration-300"></div>
            </div>

            {/* Playlist Info */}
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

          {/* Play All Button */}
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

        {/* Track List */}
        {tracks.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-16 h-16 text-red-400 dark:text-red-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-200">
              No liked songs yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-lg">
              Start building your collection by liking songs you love. They'll appear here for easy access.
            </p>
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="w-8">#</div>
                <div className="w-14"></div>
                <div className="flex-1">Title</div>
                <div className="w-16 text-center">
                  <Clock className="w-4 h-4 mx-auto" />
                </div>
                <div className="w-12"></div>
              </div>
            </div>

            {/* Track List */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {tracks.map((track, index) => {
                const isCurrentTrack = currentTrack?.spotify_id === track.spotify_id;
                const isCurrentlyPlaying = isCurrentTrack && isPlaying;
                
                return (
                  <div
                    key={track.spotify_id}
                    className={`flex items-center px-6 py-4 hover:bg-gray-50/70 dark:hover:bg-gray-800/70 transition-all duration-200 group cursor-pointer ${
                      isCurrentTrack ? 'bg-green-50/70 dark:bg-green-900/20' : ''
                    }`}
                    onMouseEnter={() => setHoveredTrack(track.spotify_id)}
                    onMouseLeave={() => setHoveredTrack(null)}
                    onClick={() => handlePlay(track)}
                  >
                    {/* Track Number / Play Button */}
                    <div className="w-8 flex items-center justify-center">
                      {hoveredTrack === track.spotify_id || isCurrentTrack ? (
                        <button className="w-6 h-6 flex items-center justify-center">
                          {isCurrentlyPlaying ? (
                            <Pause className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" />
                          ) : (
                            <Play className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="currentColor" />
                          )}
                        </button>
                      ) : (
                        <span className={`text-sm font-medium ${
                          isCurrentTrack ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Album Art */}
                    <div className="w-14 h-14 ml-2 mr-4">
                      {track.album_art ? (
                        <img
                          src={track.album_art}
                          alt={track.title}
                          className="w-full h-full object-cover rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                          <Music className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold truncate ${
                        isCurrentTrack ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {track.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {track.artist}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="w-16 text-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDuration(track.duration)}
                      </span>
                    </div>

                    {/* Remove Button */}
                    <div className="w-12 flex justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(track.spotify_id);
                        }}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}