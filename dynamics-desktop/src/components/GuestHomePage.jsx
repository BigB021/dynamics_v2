import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Music, Clock, Globe } from 'lucide-react';

const GuestHomePage = () => {
  const navigate = useNavigate();

  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchGuestHomeData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:3000/api/guest-home');
        if (!res.ok) throw new Error('Failed to fetch guest homepage data');
        const data = await res.json();

        setFeaturedPlaylists(data.featuredPlaylists || []);
        setAlbums(data.albums || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGuestHomeData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-900 dark:text-white">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full mb-4 mx-auto"></div>
          <p className="text-gray-300 text-lg font-medium animate-pulse">Loading guest homepage...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-red-500 p-6">
        <p className="mb-4">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-purple-600 rounded hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-slate-900 dark:via-zinc-900 dark:to-slate-900 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative overflow-hidden transition-colors duration-300">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white animate-gradient-x bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          Welcome to Dynamics
        </h1>
        <p className="mt-4 text-gray-400 text-base max-w-xl mx-auto">
          Explore trending tracks and playlists. Log in to unlock full personalized music features.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="mt-10 items-center gap-2 px-4 sm:px-6 py-3 bg-rose-900 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl hover:shadow-purple-500/25 hover:bg-rose-700 transition-all duration-300 transform hover:scale-105 "
        >
          Log In
        </button>
      </div>

      {/* Featured Playlists */}
      {featuredPlaylists.length > 0 && (
        <section className="animate-fade-in-up mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <Music className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Playlists</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredPlaylists.map((playlist, i) => (
              <div
                key={playlist.id}
                className="bg-white/5 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white/10 hover:border-purple-500/50 cursor-pointer group transform hover:scale-105 transition-all duration-300"
                onClick={() => alert('Please log in to access')}
              >
                <div className="relative mb-3 overflow-hidden rounded-xl">
                  <img
                    src={playlist.cover}
                    alt={playlist.name}
                    className="w-full h-24 sm:h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300">
                    <Play className="w-6 h-6 text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="currentColor" />
                  </div>
                </div>
                <h3 className="text-gray-900 dark:text-white truncate text-sm sm:text-base font-semibold">{playlist.name}</h3>
                <p className="text-xs sm:text-sm text-gray-400 truncate">{playlist.trackCount} tracks</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* New Releases */}
      {albums.length > 0 && (
        <section className="animate-fade-in-up mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl shadow-lg">
              <Clock className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Releases</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {albums.map((album, i) => (
              <div
                key={album.id}
                className="bg-white/5 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white/10 hover:border-green-500/50 cursor-pointer group transform hover:scale-105 transition-all duration-300"
                onClick={() => alert('Please log in to access')}
              >
                <div className="relative mb-3 overflow-hidden rounded-xl">
                  <img
                    src={album.cover}
                    alt={album.name}
                    className="w-full h-24 sm:h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300">
                    <Play className="w-6 h-6 text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="currentColor" />
                  </div>
                </div>
                <h3 className="text-gray-900 dark:text-white truncate text-sm sm:text-base font-semibold">{album.name}</h3>
                <p className="text-xs sm:text-sm text-gray-400 truncate">{album.artist}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Static Genres */}
      <section className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-lg">
            <Globe className="w-6 h-6 text-gray-900 dark:text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Genres</h2>
        </div>
        <p className="text-gray-400">Pop, Rock, Hip-Hop, Jazz, Classical</p>
      </section>

      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default GuestHomePage;