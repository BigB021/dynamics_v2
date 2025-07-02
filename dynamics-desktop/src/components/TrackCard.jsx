import React, { useState, useRef, useEffect } from 'react';
import { Play, MoreVertical } from 'lucide-react';

const TrackCard = ({ track, onDelete, onPlay }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [playlistMenuOpen, setPlaylistMenuOpen] = useState(false);
  const menuRef = useRef();

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

  return (
    <div
      onClick={onPlay}
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

      {/* Dropdown Menu */}
      <div className="absolute top-3 right-3" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
            fetchPlaylists();
          }}
          className="p-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-white shadow"
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
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-100 dark:hover:bg-blue-700 text-blue-600 dark:text-blue-300"
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
