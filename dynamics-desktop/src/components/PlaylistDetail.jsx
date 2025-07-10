import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';
import { ArrowLeft, Play, Music, Clock, User, Hash } from 'lucide-react';
import TrackList from '../components/TrackList';
import { authFetch } from '../utils/authFetch';
import { getBackendURL } from '../utils/authFetch';

const PlaylistDetail = () => {
  const { id } = useParams();
  const [tracks, setTracks] = useState([]);
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [backendURL, setBackendURL] = useState(null);
  const navigate = useNavigate();

  const { playTrack, setQueue, currentTrack } = useContext(PlayerContext);

  useEffect(() => {
    async function fetchData() {
      try {
        const url = await getBackendURL();
        setBackendURL(url);
        const res = await authFetch(`${url}/api/playlists/${id}`);
        const data = await res.json();
        const { playlist, tracks } = data;
        const enriched = tracks
          .filter(track => track.file_path)
          .map(track => ({
            ...track,
            url: `${url}/media/${track.file_path.split('/').pop()}`,
            cover: track.cover ? `${url}/media/${track.cover}` : null,
          }));

        setTracks(enriched);
        setPlaylistInfo({
          name: playlist.name || 'Untitled Playlist',
          cover: playlist.cover,
          trackCount: enriched.length,
        });

        console.log('Fetched playlist:', playlist);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, [id]);

  const handlePlay = (track) => {
    setQueue(tracks);
    playTrack(track, tracks);
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      setQueue(tracks);
      playTrack(tracks[0], tracks);
    }
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
              {playlistInfo?.cover ? (
                <img
                  src={`${backendURL}/media/${playlistInfo.cover}`}
                  alt="Playlist cover"
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
                Playlist Collection
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 leading-tight">
                {playlistInfo?.name || 'Loading...'}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Hash size={16} />
                  <span className="font-medium">{tracks.length} tracks</span>
                </div>
                {tracks.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>~{Math.ceil(tracks.reduce((acc, track) => acc + (track.duration || 180), 0) / 60)} minutes</span>
                  </div>
                )}
              </div>

              {tracks.length > 0 && (
                <button
                  onClick={handlePlayAll}
                  className="flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Play size={20} fill="currentColor" />
                  Play Collection
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 md:px-12">
        {Array.isArray(tracks) && tracks.length > 0 ? (
          <TrackList tracks={tracks} onPlay={handlePlay} title="Tracks" />
        ) : (
          <div className="text-center py-20 bg-white/40 backdrop-blur-sm rounded-3xl border border-white/20 dark:bg-gray-900/60 dark:border-gray-700">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Music size={40} className="text-slate-500 dark:text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">Empty Collection</h3>
            <p className="text-slate-500 dark:text-slate-400 text-lg">This playlist is ready for your favorite tracks</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;
