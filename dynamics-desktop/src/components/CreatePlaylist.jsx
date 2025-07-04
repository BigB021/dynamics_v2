import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Music, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const CreatePlaylist = () => {
  const [name, setName] = useState('');
  const [cover, setCover] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  React.useEffect(() => {
    if (!user) {
      navigate('/login'); // or show a message
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in to create a playlist.');
      return;
    }

    const formData = new FormData();
      formData.append('name', name);
      if (cover) formData.append('cover', cover);
    
      try {
        const res = await fetch('http://localhost:3000/api/playlists', {
          method: 'POST',
          headers: {
            // If your backend expects auth token in header:
            Authorization: `Bearer ${token}`, 
            // Don't set Content-Type here, browser sets it automatically with FormData
          },
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
  

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCover(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-purple-900/20 to-black text-white">
      <div className="p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-6 mb-12">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-all duration-300 hover:scale-110"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create Playlist
            </h1>
            <p className="text-zinc-400">Design your perfect music collection</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gradient-to-r from-zinc-800/40 to-zinc-700/40 backdrop-blur-xl rounded-3xl p-8 border border-zinc-700/50 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Playlist Name */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 uppercase tracking-wider">
                <Sparkles size={16} />
                Playlist Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your playlist name..."
                required
                className="w-full p-6 rounded-2xl bg-zinc-800/60 border border-zinc-600/50 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-xl font-semibold"
              />
            </div>

            {/* Cover Upload */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 uppercase tracking-wider">
                <Upload size={16} />
                Cover Image
              </label>
              
              <div
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-zinc-600 hover:border-zinc-500 bg-zinc-800/30'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCover(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {cover ? (
                  <div className="space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-lg">
                      <img
                        src={URL.createObjectURL(cover)}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-green-400 font-semibold">{cover.name}</p>
                    <p className="text-zinc-500 text-sm">Click to change or drag a new image</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center shadow-lg">
                      <Music size={32} className="text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-2">Drop your cover image here</p>
                      <p className="text-zinc-500">or click to browse files</p>
                      <p className="text-zinc-600 text-sm mt-2">JPG, PNG up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-zinc-700 disabled:to-zinc-800 disabled:text-zinc-500 text-white font-bold px-8 py-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105 disabled:hover:scale-100 text-lg"
            >
              <Sparkles size={20} />
              Create Playlist
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylist;