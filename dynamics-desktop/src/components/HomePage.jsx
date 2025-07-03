import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Download, AlertCircle } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';
import SearchBar from './SearchBar';

const HomePage = () => {
  const [data, setData] = useState(null);
  const [downloadedTracks, setDownloadedTracks] = useState({});
  const [downloadingTrackId, setDownloadingTrackId] = useState(null);
  const [progressText, setProgressText] = useState('');
  const eventSourceRef = useRef(null);

  const navigate = useNavigate();
  const { playTrack, setQueue } = useContext(PlayerContext);

  useEffect(() => {
    fetch('http://localhost:3000/api/home')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // Check if a track is downloaded by ID; update from your backend or local state
  const checkIfDownloaded = (trackId, filePath) => {
    setDownloadedTracks(prev => ({
      ...prev,
      [trackId]: `http://localhost:3000/media/${encodeURIComponent(filePath)}`,
    }));
  };

  // Download logic for tracks, similar to SearchResultItem approach
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
          // Assume backend returns filePath in message or construct it:
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

    // Use downloaded file URL if available, otherwise use preview_url for 30s preview
    const playableUrl = downloadedTracks[track.id] || track.preview_url;

    if (!playableUrl) {
      alert('No playable audio available for this track yet.');
      return;
    }

    playTrack({ ...track, url: playableUrl }, queue);
  };

  if (!data) {
    return <div className="p-12 text-center text-gray-500 dark:text-gray-300">Loading your music...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-indigo-900 text-slate-800 dark:text-slate-200 font-sans px-6 md:px-12 py-10">
      <h1 className="text-4xl font-black mb-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
        {data.greeting}
      </h1>

      {/* SearchBar if you want, else remove */}
      <SearchBar />

      {/* Featured Playlists */}
      {data.playlists.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Featured Playlists</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {data.playlists.map(p => (
              <div
                key={p.id}
                className="bg-white/60 dark:bg-gray-800/70 backdrop-blur-md p-4 rounded-xl shadow hover:scale-105 transition-transform cursor-pointer"
                onClick={() => navigate(`/playlist/${p.id}`)}
              >
                <img src={p.cover} alt={p.name} className="w-full h-36 object-cover rounded-lg mb-3" />
                <h3 className="font-semibold truncate">{p.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{p.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* New Releases - Disable album click, show alert */}
      {data.albums.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">New Releases</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {data.albums.map(a => (
              <div
                key={a.id}
                className="bg-white/60 dark:bg-gray-800/70 backdrop-blur-md p-4 rounded-xl shadow cursor-default"
                onClick={() => alert('Album playback or details coming soon!')}
              >
                <img src={a.cover} alt={a.name} className="w-full h-36 object-cover rounded-lg mb-3" />
                <h3 className="font-semibold truncate">{a.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{a.artist}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Tracks with preview + download button */}
      {data.recent.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Trending Tracks</h2>
          <div className="flex flex-col gap-4">
            {data.recent.map(track => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 shadow rounded-xl hover:shadow-md transition-all"
              >
                <img
                  src={track.cover || '/default_cover.jpg'}
                  alt={`${track.title} cover`}
                  className="w-16 h-16 rounded-lg object-cover shadow-sm"
                />
                <div className="flex-grow min-w-0">
                  <h3 className="font-semibold text-zinc-800 dark:text-white truncate">{track.title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                    {track.artist} <span className="italic text-xs ml-1">({track.album || 'Unknown Album'})</span>
                  </p>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  {/* Play button */}
                  <button
                    onClick={() => handlePlay(track, data.recent)}
                    className="w-10 h-10 flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white rounded-full"
                    title="Play Preview or Downloaded Track"
                  >
                    <Play size={18} />
                  </button>

                  {/* Download button or spinner */}
                  {downloadingTrackId === track.id ? (
                    <div className="text-green-600 italic">{progressText}</div>
                  ) : downloadedTracks[track.id] ? (
                    <div
                      className="text-green-600 flex items-center gap-1 cursor-default"
                      title="Downloaded"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">Downloaded</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownload(track)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-700 hover:bg-green-800 text-white rounded-full shadow"
                      title="Download Track"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Genre Recommendations, similar to Trending Tracks */}
      {data.genreSections.length > 0 && data.genreSections.map(section => (
        <section key={section.genre} className="mb-16">
          <h2 className="text-2xl font-bold mb-6 capitalize">Recommended in {section.genre}</h2>
          <div className="flex flex-col gap-4">
            {section.tracks.map(track => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 shadow rounded-xl hover:shadow-md transition-all"
              >
                <img
                  src={track.cover || '/default_cover.jpg'}
                  alt={`${track.title} cover`}
                  className="w-16 h-16 rounded-lg object-cover shadow-sm"
                />
                <div className="flex-grow min-w-0">
                  <h3 className="font-semibold text-zinc-800 dark:text-white truncate">{track.title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                    {track.artist} <span className="italic text-xs ml-1">({track.album || 'Unknown Album'})</span>
                  </p>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => handlePlay(track, section.tracks)}
                    className="w-10 h-10 flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white rounded-full"
                    title="Play Preview or Downloaded Track"
                  >
                    <Play size={18} />
                  </button>

                  {downloadingTrackId === track.id ? (
                    <div className="text-green-600 italic">{progressText}</div>
                  ) : downloadedTracks[track.id] ? (
                    <div
                      className="text-green-600 flex items-center gap-1 cursor-default"
                      title="Downloaded"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">Downloaded</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownload(track)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-700 hover:bg-green-800 text-white rounded-full shadow"
                      title="Download Track"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

    </div>
  );
};

export default HomePage;
