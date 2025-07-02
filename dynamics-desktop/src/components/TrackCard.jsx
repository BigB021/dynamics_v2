import React, { useState, useRef, useEffect, useContext } from 'react';
import { Play, MoreVertical } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';

const TrackCard = ({ track, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [playlistMenuOpen, setPlaylistMenuOpen] = useState(false);
  const menuRef = useRef();

  const { setCurrentTrack, setQueue, currentTrack, setShouldAutoPlay } = useContext(PlayerContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setPlaylistMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPlaylists = () => {
    fetch('http://localhost:3000/api/playlists')
      .then(res => res.json())
      .then(setPlaylists)
      .catch(console.error);
  };

  const handleAddToPlaylist = (playlistId) => {
    fetch(`http://localhost:3000/api/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spotifyId: track.spotify_id }),
    })
      .then(res => res.json())
      .then(data => {
        alert('Added to playlist');
        setMenuOpen(false);
        setPlaylistMenuOpen(false);
      })
      .catch(err => {
        alert('Failed to add track');
        console.error(err);
      });
  };

  const handleTrackClick = () => {
    // Signal that we want to auto-play this track
    setShouldAutoPlay(true);
    
    // Set the current track to trigger playback
    setCurrentTrack(track);
    
    // Optionally set a queue with just this track, or you could pass a full queue
    setQueue([track]);
  };

  const isCurrentTrack = currentTrack?.spotify_id === track.spotify_id;

  return (
    <div
      onClick={handleTrackClick}
      className={`relative group bg-white dark:bg-zinc-900 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all ${
        isCurrentTrack ? 'ring-2 ring-indigo-500 shadow-indigo-200 dark:shadow-indigo-900' : ''
      }`}
    >
      {/* Cover */}
      <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
        <img
          src={track.cover}
          alt={`${track.title} cover`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
          <div className="p-3 bg-indigo-600 text-white rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play size={24} fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="p-4">
        <div className={`text-lg font-semibold truncate ${
          isCurrentTrack ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-800 dark:text-white'
        }`}>
          {track.title}
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{track.artist}</div>
        <div className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{track.filename}</div>
        
        {/* Bottom right play indicator */}
        <div className={`absolute bottom-3 right-3 transition-all duration-300 ${
          isCurrentTrack ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <div className={`p-2 rounded-full shadow-lg ${
            isCurrentTrack ? 'bg-indigo-600 text-white' : 'bg-indigo-800 text-white'
          }`}>
            <Play size={20} fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      <div className="absolute top-3 right-3" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
            fetchPlaylists();
          }}
          className="p-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical size={18} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded shadow-lg z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(track.spotify_id);
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-red-100 dark:hover:bg-red-800 text-red-600 dark:text-red-300"
            >
              Delete
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setPlaylistMenuOpen(!playlistMenuOpen);
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              Add to Playlist
            </button>

            {playlistMenuOpen && (
              <div className="max-h-40 overflow-auto">
                {playlists.map(pl => (
                  <button
                    key={pl.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToPlaylist(pl.id);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-blue-300"
                  >
                    {pl.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackCard;