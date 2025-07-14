import React, { useState, useRef, useEffect, useContext } from 'react';
import { Play, Pause, MoreVertical, Heart, Plus } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';
import { authFetch, getBackendURL } from '../utils/authFetch';
import { AuthContext } from '../context/AuthContext';
import { FavoritesContext } from '../context/FavoritesContext';

const TrackListItem = ({ track, onDelete, onPlay, index }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [playlistMenuOpen, setPlaylistMenuOpen] = useState(false);
  const menuRef = useRef();

  const { setCurrentTrack, setQueue, currentTrack, setShouldAutoPlay, playTrack, isPlaying } = useContext(PlayerContext);
  const { token } = useContext(AuthContext);
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  const isLiked = isFavorite(track.spotify_id);

  const [backendURL, setBackendURL] = useState(null);

  useEffect(() => {
    // Load backend URL once on mount
    (async () => {
      const url = await getBackendURL();
      setBackendURL(url);
    })();
  }, []);

  const fetchPlaylists = async () => {
    if (!token) return alert("You must be logged in");
    if (!backendURL) return alert("Backend URL not loaded");

    try {
      const res = await authFetch(`${backendURL}/api/playlists`); // authFetch adds headers internally
      if (!res.ok) throw new Error('Failed to fetch playlists');
      const data = await res.json();
      setPlaylists(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load playlists');
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!token) return alert("You must be logged in");
    if (!backendURL) return alert("Backend URL not loaded");

    try {
      const res = await authFetch(`${backendURL}/api/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotifyId: track.spotify_id }),
      });
      if (!res.ok) throw new Error('Failed to add track to playlist');
      alert('Track added to playlist');
      setMenuOpen(false);
      setPlaylistMenuOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to add track to playlist');
    }
  };

  const clickLock = useRef(false);

  const handleTrackClick = () => {
    if (clickLock.current) return;
    clickLock.current = true;
    setTimeout(() => (clickLock.current = false), 200);

    if (onPlay) {
      onPlay();
    }
  };

  const handleLikeToggle = async (e) => {
    e.stopPropagation();
    const success = await toggleFavorite(track.spotify_id, track);
    if (!success) {
      alert('Failed to toggle favorite');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCurrentTrack = currentTrack?.spotify_id === track.spotify_id;
  const showPlayIcon = isCurrentTrack && isPlaying;
  
  return (
    <div
      onClick={handleTrackClick}
      className={`group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-zinc-800/50 ${
        isCurrentTrack ? 'bg-indigo-50 dark:bg-indigo-950/30' : ''
      }`}
    >
      {/* Track Number / Play Button */}
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center relative">
        <span className={`text-sm font-medium group-hover:opacity-0 transition-opacity ${
          isCurrentTrack ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
        }`}>
          {track.track_number ?? index + 1}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTrackClick();
          }}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {showPlayIcon ? (
            <Pause size={16} className="text-indigo-600 dark:text-indigo-400" fill="currentColor" />
          ) : (
            <Play size={16} className="text-gray-700 dark:text-gray-300" fill="currentColor" />
          )}
        </button>
      </div>

      {/* Album Cover */}
      <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
        <img
          src={track.cover}
          alt={`${track.title} cover`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-sm md:text-base truncate ${
          isCurrentTrack ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
        }`}>
          {track.title}
        </div>
        <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
          {track.artist}
        </div>
      </div>

      {/* Desktop: Album Name (Hidden on mobile) */}
      <div className="hidden lg:block flex-1 min-w-0 px-4">
        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {track.album || 'Unknown Album'}
          {track.disc_number ? ` (Disc ${track.disc_number})` : ''}
        </div>
      </div>

      {/* Desktop: Duration (Hidden on mobile) */}
      <div className="hidden md:block flex-shrink-0 w-16 text-right">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatDuration(track.duration)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Like Button */}
        <button
          onClick={handleLikeToggle}
          className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <Heart
            size={16}
            fill={isLiked ? 'currentColor' : 'none'}
            strokeWidth={isLiked ? 0 : 2}
          />
        </button>

        {/* More Options */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
              fetchPlaylists();
            }}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 transition-colors"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg z-20">
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlaylistMenuOpen(!playlistMenuOpen);
                  }}
                  className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300"
                >
                  <Plus size={16} />
                  Add to Playlist
                </button>

                {playlistMenuOpen && (
                  <div className="border-t border-gray-200 dark:border-zinc-700 max-h-40 overflow-auto">
                    {playlists.map(pl => (
                      <button
                        key={pl.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToPlaylist(pl.id);
                        }}
                        className="block w-full text-left px-6 py-2 text-sm hover:bg-blue-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                      >
                        {pl.name}
                      </button>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-zinc-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(track.spotify_id);
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400"
                  >
                    Remove from Library
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Container component for the track list
const TrackList = ({ tracks, onDelete, onPlay, title = "Songs" }) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {tracks.length} {tracks.length === 1 ? 'song' : 'songs'}
        </span>
      </div>

      {/* Table Header (Desktop only) */}
      <div className="hidden lg:flex items-center gap-4 px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 mb-2">
        <div className="w-8">#</div>
        <div className="w-14"></div>
        <div className="flex-1">Title</div>
        <div className="flex-1 px-4">Album</div>
        <div className="w-16 text-right">Duration</div>
        <div className="w-20"></div>
      </div>

      {/* Track List */}
      <div className="space-y-1 mb-20">
        {tracks.map((track, index) => (
          <TrackListItem
            key={track.spotify_id}
            track={track}
            index={index}
            onDelete={onDelete}
            onPlay={() => onPlay && onPlay(track)}
          />
        ))}
      </div>
    </div>
  );
};

export default TrackList;