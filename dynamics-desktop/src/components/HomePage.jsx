import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Download, Shuffle, TrendingUp, Star, Globe,
  Music, Headphones, RefreshCw, Clock, Heart
} from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';
import SearchBar from './SearchBar';
import TrackRow from './TrackRow';
import { AuthContext } from '../context/AuthContext';
import { getBackendURL } from '../utils/authFetch';

const HomePage = () => {
  const [data, setData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [backendURL, setBackendURL] = useState(null);

  const navigate = useNavigate();
  const { token } = useContext(AuthContext);  

  const fetchData = async () => {
    try {
      if (!backendURL) return; // wait until backendURL is set
      const res = await fetch(`${backendURL}/api/home`, {
        headers: {
          Authorization: `Bearer ${token}`,  
        },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const newData = await res.json();
      setData(newData);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    async function init() {
      const url = await getBackendURL();
      setBackendURL(url);
    }
    init();
  }, []);

  useEffect(() => {
    if (token && backendURL) {
      fetchData();
    }
  }, [token, backendURL]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-slate-900 dark:via-zinc-900 dark:to-slate-900 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative overflow-hidden transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
        {/* Search Bar with enhanced styling */}
        <div className="mb-8 sm:mb-12 transform animate-fade-in">
          <SearchBar />
        </div>

        {!data ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="relative">
              <div className="animate-spin w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full mb-6"></div>
              <div className="animate-ping absolute top-0 left-0 w-16 h-16 border-4 border-purple-500/20 rounded-full"></div>
            </div>
            <p className="text-gray-300 text-lg font-medium animate-pulse">Loading your personalized music feed...</p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12 ">
            {/* HEADER */}
            <div className=" flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 animate-slide-up">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 animate-gradient-x ">
                  {data.greeting}
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">
                  Discover music from {data.metadata?.market} • {data.metadata?.genres?.join(', ')}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl hover:shadow-purple-500/25 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 ${
                  isRefreshing ? 'animate-pulse' : ''
                } group`}
              >
                <RefreshCw size={18} className={`${isRefreshing ? 'animate-spin' : ''} text-purple-400 group-hover:text-purple-300 transition-colors`} />
                <span className="font-medium text-gray-800 dark:text-white">Refresh</span>
              </button>
            </div>

            {/* Artist Spotlight */}
            {data.artistSpotlight?.tracks?.length > 0 && (
              <section className="animate-fade-in-up delay-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                    <Star className="w-6 h-6 text-gray-800 dark:text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                    Artist Spotlight: {data.artistSpotlight.name}
                  </h2>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl">
                  <div className="space-y-2">
                    {data.artistSpotlight.tracks.slice(0, 5).map((track, index) => (
                      <div key={track.id} className="transform hover:scale-[1.02] transition-transform duration-200">
                        <TrackRow
                          track={track}
                          queue={data.artistSpotlight.tracks}
                          showIndex={true}
                          index={index}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Charts */}
            {data.charts?.tracks?.length > 0 && (
              <section className="animate-fade-in-up delay-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
                    <TrendingUp className="w-6 h-6 text-gray-800 dark:text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                    Trending in {data.charts.country}
                  </h2>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl">
                  <div className="space-y-2">
                    {data.charts.tracks.map((track, index) => (
                      <div key={track.id} className="transform hover:scale-[1.02] transition-transform duration-200">
                        <TrackRow
                          track={track}
                          queue={data.artistSpotlight.tracks}
                          showIndex={true}
                          index={index}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Featured Playlists */}
            {data.playlists?.length > 0 && (
              <section className="animate-fade-in-up delay-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <Music className="w-6 h-6 text-gray-800 dark:text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Featured Playlists</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {data.playlists.map((playlist, index) => (
                    <div
                      key={playlist.id}
                      className="bg-white/5 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-xl hover:shadow-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group transform hover:scale-105 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => navigate(`/playlist/${playlist.id}`)}
                    >
                      <div className="relative mb-3 sm:mb-4 overflow-hidden rounded-xl">
                        <img
                          src={playlist.cover}
                          alt={playlist.name}
                          className="w-full h-24 sm:h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                          <Play className="w-6 h-6 sm:w-8 sm:h-8 text-gray-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" fill="currentColor" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-white truncate text-sm sm:text-base">{playlist.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">{playlist.trackCount} tracks</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* New Releases */}
            {data.albums?.length > 0 && (
              <section className="animate-fade-in-up delay-400">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl shadow-lg">
                    <Clock className="w-6 h-6 text-gray-800 dark:text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">New Releases</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {data.albums.map((album, index) => (
                    <div
                      key={album.id}
                      className="bg-white/5 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-xl hover:shadow-2xl border border-white/10 hover:border-green-500/50 transition-all duration-300 cursor-pointer group transform hover:scale-105 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => navigate(`/album/${album.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter') navigate(`/album/${album.id}`); }}
                    >
                      <div className="relative mb-3 sm:mb-4 overflow-hidden rounded-xl">
                        <img
                          src={album.cover}
                          alt={album.name}
                          className="w-full h-24 sm:h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                          <Play className="w-6 h-6 sm:w-8 sm:h-8 text-gray-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" fill="currentColor" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-white truncate text-sm sm:text-base">{album.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">{album.artist}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Genre Sections */}
            {data.genreSections?.length > 0 && data.genreSections.map((section, sectionIndex) => (
              <section key={sectionIndex} className="animate-fade-in-up" style={{ animationDelay: `${500 + sectionIndex * 100}ms` }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-lg">
                    <Globe className="w-6 h-6 text-gray-800 dark:text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                    {section.genre} Recommendations
                  </h2>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl">
                  <div className="space-y-2">
                    {section.tracks.map((track, index) => (
                      <div key={track.id} className="transform hover:scale-[1.02] transition-transform duration-200">
                        <TrackRow
                          track={track}
                          queue={data.artistSpotlight.tracks}
                          showIndex={true}
                          index={index}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}

            {/* Mood Section */}
            {data.moodSection?.playlists?.length > 0 && (
              <section className="animate-fade-in-up delay-600">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg">
                    <Headphones className="w-6 h-6 text-gray-800 dark:text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                    {data.moodSection.mood} Vibes
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {data.moodSection.playlists.map((playlist, index) => (
                    <div
                      key={playlist.id}
                      className="bg-white/5 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-xl hover:shadow-2xl border border-white/10 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group transform hover:scale-105 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => navigate(`/playlist/${playlist.id}`)}
                    >
                      <div className="relative mb-3 sm:mb-4 overflow-hidden rounded-xl">
                        <img
                          src={playlist.cover}
                          alt={playlist.name}
                          className="w-full h-20 sm:h-24 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                          <Play className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" fill="currentColor" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-white truncate text-sm sm:text-base">{playlist.name}</h3>
                      <p className="text-xs text-gray-400 truncate">{playlist.trackCount} tracks</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Footer */}
            <footer className="mt-sm:mt-16 pt-6 sm:pt-8 border-t border-white/10 animate-fade-in-up delay-700">
              <div className="text-center text-gray-400 space-y-3">
                <p className="text-sm sm:text-base">Last updated: {data.metadata?.timestamp ? new Date(data.metadata.timestamp).toLocaleString() : 'Now'}</p>
                <div className="flex items-center justify-center gap-2">
                  <Shuffle size={16} className="text-purple-400" />
                  <span className="text-sm">Shuffle through endless music discoveries</span>
                </div>
                  <span className="text-md pt-10 ">Made By Youssef aka.  <a className='text-pink-400 hover:text-pink-700' href="https://github.com/BigB021">@Bigb_021</a> </span>
              </div>
              <div className="mt-12"></div>
            </footer>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-slide-up { animation: slide-up 0.8s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        .animate-gradient-x { 
          background-size: 200% 200%; 
          animation: gradient-x 3s ease infinite; 
        }
        
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }
        .delay-700 { animation-delay: 700ms; }
        .delay-1000 { animation-delay: 1000ms; }
        .delay-2000 { animation-delay: 2000ms; }
      `}</style>
    </div>
  );
};

export default HomePage;