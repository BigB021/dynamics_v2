import React, { useState, useRef, useEffect } from 'react';
import { Play, MoreVertical } from 'lucide-react';

const TrackCard = ({ track, onDelete, onPlay }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      {/* 3-dot Menu */}
      <div className="absolute top-3 right-3" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          className="p-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-white shadow"
        >
          <MoreVertical size={18} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded shadow-lg z-10">
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
                alert('Add to queue (not yet implemented)');
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              Add to Queue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackCard;
