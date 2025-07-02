import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreatePlaylist = () => {
  const [name, setName] = useState('');
  const [cover, setCover] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    if (cover) formData.append('cover', cover);

    try {
      const res = await fetch('http://localhost:3000/api/playlists', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to create playlist');
      const playlist = await res.json();
      navigate(`/playlist/${playlist.id}`);
    } catch (err) {
      setError('Playlist name must be unique or server error');
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Playlist</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Playlist name"
          required
          className="w-full p-2 rounded border border-gray-300 dark:bg-zinc-800"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCover(e.target.files[0])}
          className="w-full"
        />

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Playlist
        </button>
      </form>
    </div>
  );
};

export default CreatePlaylist;
