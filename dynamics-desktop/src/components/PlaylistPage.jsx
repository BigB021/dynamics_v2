import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Music, Calendar } from 'lucide-react';

const PlaylistPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [name, setName] = useState('');
  const [cover, setCover] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = () => {
    fetch('http://localhost:3000/api/playlists')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPlaylists(data);
        } else {
          console.error('Expected array, got:', data);
          setPlaylists([]);
        }
      })
      .catch(err => {
        console.error('Fetch failed:', err);
        setPlaylists([]);
      });
  };

  const handleAddPlaylist = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    if (cover) formData.append('cover', cover);

    try {
      const res = await fetch('http://localhost:3000/api/playlists', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to create playlist');

      setName('');
      setCover(null);
      setShowForm(false);
      fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;

    try {
      const res = await fetch(`http://localhost:3000/api/playlists/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950 text-theme.neon.text flex flex-col">
      <div className="p-8 max-w-7xl mx-auto flex-grow">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1
              className="text-5xl font-extrabold mb-2"
              style={{ color: 'var(--text)', backgroundImage: 'linear-gradient(45deg, #a855f7, #223eee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Your Library
            </h1>
            <p className="text-theme.neon.textSecondary text-lg select-none">
              {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="group flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <Plus
              size={20}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            {showForm ? 'Cancel' : 'Create Playlist'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="mb-12 bg-[rgba(255,255,255,0.1)] backdrop-blur-md rounded-3xl p-8 border border-[rgba(255,255,255,0.15)] shadow-lg">
            <h3 className="text-2xl font-semibold mb-6 text-theme.neon.textSecondary">
              Create New Playlist
            </h3>
            <form onSubmit={handleAddPlaylist} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-theme.neon.textSecondary uppercase tracking-wide">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={name}
                  required
                  onChange={e => setName(e.target.value)}
                  placeholder="My awesome playlist"
                  className="w-full p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] text-theme.neon.text placeholder-theme.neon.textMuted focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300 text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-theme.neon.textSecondary uppercase tracking-wide">
                  Cover Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setCover(e.target.files[0])}
                  className="w-full rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] text-theme.neon.text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gradient-to-l from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 file:text-white file:font-semibold hover:file:from-cyan-600 hover:file:to-purple-700 transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <Music size={20} />
                Create Playlist
              </button>
            </form>
          </div>
        )}

        {/* Playlists Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {playlists.map(pl => (
            <div
              key={pl.id}
              className="group relative bg-[rgba(255,255,255,0.05)] backdrop-blur-md rounded-3xl p-6 hover:bg-[rgba(255,255,255,0.05)] transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_8px_30px_rgb(134,90,198,0.1)] border border-[rgba(255,255,255,0.08)]"
            >
              <Link to={`/playlist/${pl.id}`} className="block rounded-2xl overflow-hidden shadow-lg">
                <div className="relative overflow-hidden rounded-2xl">
                  {pl.cover ? (
                    <img
                      src={`http://localhost:3000/media/${pl.cover}`}
                      alt={`${pl.name} cover`}
                      className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full aspect-square text-white bg-gradient-to-br from-[#a128e7bb] to-[#062acaa4] dark:from-[#2a3047] dark:to-[#1b2037] flex items-center justify-center">
                      <Music size={48} className="text-theme.neon.textMuted " />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.5)] to-transparent opacity-70 pointer-events-none"></div>
                </div>

                <div className="mt-4 space-y-2 px-4 py-2">
                  <h3
                    className="text-xl font-semibold truncate"
                    style={{ color: 'var(--text)' }}
                  >
                    {pl.name}
                  </h3>
                  <div className="flex items-center gap-2 text-theme.neon.textSecondary text-sm">
                    <Calendar size={14} />
                    <span>Created {new Date(pl.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>

              <button
                onClick={() => handleDelete(pl.id)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-red-600/90 hover:bg-red-600 text-white p-3 rounded-full shadow-lg hover:scale-110 backdrop-blur-sm focus:outline-none"
                title="Delete playlist"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {playlists.length === 0 && (
          <div className="text-center py-20 text-theme.neon.textMuted">
            <Music size={80} className="mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--textSecondary)' }}>
              No playlists yet
            </h3>
            <p className="mb-8" style={{ color: 'var(--textMuted)' }}>
              Create your first playlist to get started
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-full transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <Plus size={20} />
              Create Your First Playlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistPage;
