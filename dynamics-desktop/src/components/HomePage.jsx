import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Download, Shuffle, TrendingUp, Star, Globe,
  Music, Headphones, RefreshCw, Clock, Heart
} from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';
import SearchBar from './SearchBar';
import TrackRow from './TrackRow';

const HomePage = () => {
  const [data, setData] = useState(null);
  const [downloadedTracks, setDownloadedTracks] = useState({});
  const [downloadingTrackId, setDownloadingTrackId] = useState(null);
  const [progressText, setProgressText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const eventSourceRef = useRef(null);

  const navigate = useNavigate();
  const { playTrack, setQueue, currentTrack, isPlaying } = useContext(PlayerContext);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/home');
      const newData = await res.json();
      setData(newData);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const checkIfDownloaded = (trackId, filePath) => {
    setDownloadedTracks(prev => ({
      ...prev,
      [trackId]: `http://localhost:3000/media/${encodeURIComponent(filePath)}`,
    }));
  };

  const handleDownload = async (track) => {
    setDownloadingTrackId(track.id);
    setProgressText('Starting download...');

    try {
      const res = await fetch('http://localhost:3000/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: track.url }),
      });
      const { taskId } = await res.json();

      eventSourceRef.current = new EventSource(`http://localhost:3000/api/download/progress/${taskId}`);

      eventSourceRef.current.onmessage = (event) => {
        const { state, message } = JSON.parse(event.data);
        setProgressText(message);

        if (state === 'finished') {
          setDownloadingTrackId(null);
          eventSourceRef.current.close();
          const fileName = `${track.artist} - ${track.title}.mp3`.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim();
          checkIfDownloaded(track.id, fileName);
        } else if (state === 'error') {
          setDownloadingTrackId(null);
          eventSourceRef.current.close();
          alert(`Download failed for "${track.title}": ${message}`);
        }
      };

      eventSourceRef.current.onerror = () => {
        setDownloadingTrackId(null);
        if (eventSourceRef.current) eventSourceRef.current.close();
      };
    } catch (err) {
      console.error('Download error:', err);
      setDownloadingTrackId(null);
      alert('Failed to start download');
    }
  };

  const handlePlay = (track, queue) => {
    setQueue(queue);
    const playableUrl = downloadedTracks[track.id] || track.preview_url;

    if (!playableUrl) {
      alert('No playable audio available for this track yet.');
      return;
    }

    playTrack({ ...track, url: playableUrl }, queue);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
        <SearchBar />

        {!data ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Loading your personalized music feed...</p>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                  {data.greeting}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Discover music from {data.metadata?.market} • {data.metadata?.genres?.join(', ')}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className={`flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all ${
                  isRefreshing ? 'animate-pulse' : ''
                }`}
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                <span className="font-medium">Refresh</span>
              </button>
            </div>

                    {/* Artist Spotlight */}
        {data.artistSpotlight?.tracks?.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Artist Spotlight: {data.artistSpotlight.name}
              </h2>
            </div>
            <div className="grid gap-3">
              {data.artistSpotlight.tracks.slice(0, 5).map((track, index) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  queue={data.artistSpotlight.tracks}
                  showIndex={true}
                  index={index}
                />

              ))}
            </div>
          </section>
        )}

        {/* Charts */}
        {data.charts?.tracks?.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Trending in {data.charts.country}
              </h2>
            </div>
            <div className="grid gap-3">
              {data.charts.tracks.map((track, index) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  queue={data.artistSpotlight.tracks}
                  showIndex={true}
                  index={index}
                />

              ))}
            </div>
          </section>
        )}

        {/* Featured Playlists */}
        {data.playlists?.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Featured Playlists</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {data.playlists.map(playlist => (
                <div
                  key={playlist.id}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer group"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                >
                  <div className="relative mb-4">
                    <img
                      src={playlist.cover}
                      alt={playlist.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center">
                      <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white truncate">{playlist.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{playlist.trackCount} tracks</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* New Releases */}
        {data.albums?.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">New Releases</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {data.albums.map(album => (
                <div
                  key={album.id}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-4 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => navigate(`/album/${album.id}`)}
                >
                  <div className="relative mb-4">
                    <img
                      src={album.cover}
                      alt={album.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center">
                      <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white truncate">{album.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{album.artist}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Genre Sections */}
        {data.genreSections?.length > 0 && data.genreSections.map((section, sectionIndex) => (
          <section key={sectionIndex} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {section.genre} Recommendations
              </h2>
            </div>
            <div className="grid gap-3">
              {section.tracks.map((track, index) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  queue={data.artistSpotlight.tracks}
                  showIndex={true}
                  index={index}
                />

              ))}
            </div>
          </section>
        ))}

        {/* Mood Section */}
        {data.moodSection?.playlists?.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {data.moodSection.mood} Vibes
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.moodSection.playlists.map(playlist => (
                <div
                  key={playlist.id}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer group"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                >
                  <div className="relative mb-4">
                    <img
                      src={playlist.cover}
                      alt={playlist.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center">
                      <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white truncate">{playlist.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{playlist.trackCount} tracks</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="mb-2">Last updated: {data.metadata?.timestamp ? new Date(data.metadata.timestamp).toLocaleString() : 'Now'}</p>
            <div className="flex items-center justify-center gap-2">
              <Shuffle size={16} />
              <span className="text-sm">Shuffle through endless music discoveries</span>
            </div>
          </div>
        </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;