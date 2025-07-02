import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';
import { ArrowLeft, Play, Music, Clock, User, Hash } from 'lucide-react';

const AlbumPage = () => {
  const { name } = useParams();
  const [tracks, setTracks] = useState([]);
  const [albumInfo, setAlbumInfo] = useState(null);
  const navigate = useNavigate();

  const { setCurrentTrack, setQueue, currentTrack } = useContext(PlayerContext);

  useEffect(() => {
    fetch(`http://localhost:3000/api/albums/${encodeURIComponent(name)}`)
      .then(res => res.json())
      .then(data => {
        const enriched = data.map(track => ({
          ...track,
          cover: track.cover || null,
        }));
        setTracks(enriched);
        if (enriched.length > 0) {
          setAlbumInfo({
            name: enriched[0].album,
            artist: enriched[0].artist,
            release_date: enriched[0].release_date,
            cover: enriched[0].cover,
          });
        }
      })
      .catch(console.error);
  }, [name]);

  const handlePlay = (track) => {
    setQueue(tracks);
    setCurrentTrack(track);
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      setQueue(tracks);
      setCurrentTrack(tracks[0]);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-indigo-900 text-slate-800 dark:text-slate-200 font-sans">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 dark:from-indigo-900/30 dark:to-purple-900/30"></div>
        <div className="relative px-6 py-8 md:px-12">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 p-3 rounded-xl bg-white/80 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/50 backdrop-blur-sm dark:bg-gray-800/70 dark:hover:bg-gray-700 dark:border-gray-700"
          >
            <ArrowLeft size={20} className="text-slate-700 dark:text-slate-300" />
          </button>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              {albumInfo?.cover ? (
                <img
                  src={albumInfo.cover}
                  alt="Album cover"
                  className="w-72 h-72 object-cover rounded-2xl shadow-2xl border-4 border-white/50 dark:border-gray-700"
                />
              ) : (
                <div className="w-72 h-72 bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-800 dark:to-purple-900 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-white/50 dark:border-gray-700">
                  <Music size={64} className="text-indigo-400 dark:text-indigo-300" />
                </div>
              )}
            </div>

            <div className="flex-grow space-y-6">
              <div className="inline-block px-4 py-2 bg-indigo-500 text-white rounded-full text-sm font-semibold uppercase tracking-wider dark:bg-indigo-600">
                Album Release
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 leading-tight">
                {albumInfo?.name || 'Loading...'}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span className="font-medium">{albumInfo?.artist}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{albumInfo?.release_date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash size={16} />
                  <span>{tracks.length} tracks</span>
                </div>
              </div>

              {tracks.length > 0 && (
                <button
                  onClick={handlePlayAll}
                  className="flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Play size={20} fill="currentColor" />
                  Play Album
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 md:px-12">
        {tracks.length > 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:bg-gray-900/70 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-100/80 to-indigo-50/80 dark:from-gray-800/80 dark:to-indigo-900/80 px-6 py-4 border-b border-slate-200/50 dark:border-gray-700">
              <div className="grid grid-cols-12 gap-4 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-6">Song</div>
                <div className="col-span-4">Artist</div>
                <div className="col-span-1 flex justify-center">
                  <Clock size={16} />
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-200/30 dark:divide-gray-700">
              {tracks.map((track, index) => (
                <div
                  key={track.spotify_id || index}
                  onClick={() => handlePlay(track)}
                  className={`group grid grid-cols-12 gap-4 px-6 py-4 cursor-pointer transition-all duration-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/50 ${
                    currentTrack?.spotify_id === track.spotify_id
                      ? 'bg-gradient-to-r from-indigo-100/60 to-purple-100/60 dark:from-indigo-800/70 dark:to-purple-800/70'
                      : ''
                  }`}
                >
                  <div className="col-span-1 flex items-center justify-center">
                    <span className={`text-sm font-bold group-hover:hidden ${
                      currentTrack?.spotify_id === track.spotify_id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="hidden group-hover:flex items-center justify-center w-8 h-8 bg-indigo-500 rounded-full">
                      <Play size={12} className="text-white fill-white ml-0.5" />
                    </div>
                  </div>

                  <div className="col-span-6 flex items-center gap-4 min-w-0">
                    {track.cover ? (
                      <img
                        src={track.cover}
                        alt={track.title}
                        className="w-14 h-14 object-cover rounded-xl shadow-md flex-shrink-0 border-2 border-white/50 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-white/50 dark:border-gray-700">
                        <Music size={16} className="text-slate-500 dark:text-slate-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-grow">
                      <div className={`font-bold text-lg truncate ${
                        currentTrack?.spotify_id === track.spotify_id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {track.title}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-4 flex items-center">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-400 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-slate-600 dark:text-slate-400" />
                      </div>
                      <span className="text-slate-600 dark:text-slate-400 font-medium truncate">{track.artist}</span>
                    </div>
                  </div>

                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-sm font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                      {formatDuration(track.duration)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 backdrop-blur-sm rounded-3xl border border-white/20 dark:bg-gray-900/60 dark:border-gray-700">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Music size={40} className="text-slate-500 dark:text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">No Tracks Found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-lg">This album doesn't have playable tracks</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumPage;
