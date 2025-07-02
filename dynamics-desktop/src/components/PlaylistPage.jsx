import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">My Playlists</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          {showForm ? 'Cancel' : 'Add Playlist'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddPlaylist} className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Playlist Name</label>
            <input
              type="text"
              value={name}
              required
              onChange={e => setName(e.target.value)}
              className="w-full p-2 rounded border dark:bg-zinc-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setCover(e.target.files[0])}
              className="w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
          >
            Create Playlist
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {playlists.map(pl => (
          <div
            key={pl.id}
            className="relative p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:shadow-md transition group"
          >
            <Link to={`/playlist/${pl.id}`}>
              {pl.cover && (
                <img
                  src={`http://localhost:3000/media/${pl.cover}`}
                  alt={`${pl.name} cover`}
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
              )}
              <h3 className="text-lg font-semibold">{pl.name}</h3>
              <p className="text-sm text-zinc-500">
                Created on {new Date(pl.created_at).toLocaleDateString()}
              </p>
            </Link>
            <button
              onClick={() => handleDelete(pl.id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white dark:bg-zinc-700 rounded-full p-1 shadow"
              title="Delete playlist"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistPage;
