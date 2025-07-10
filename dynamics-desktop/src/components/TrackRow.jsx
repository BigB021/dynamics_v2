import { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { Play, Download, Heart, Loader2 } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import { getBackendURL } from '../utils/authFetch';

const extractSpotifyId = (url) => {
  const match = url?.match(/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
};

const sanitizeFileName = (name) =>
  name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim();

const TrackRow = ({ track, queue, showIndex = false, index = 0 }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const eventSourceRef = useRef(null);
  const { token } = useContext(AuthContext);

  const {
    playTrack,
    currentTrack,
    setQueue,
    isPlaying,
  } = useContext(PlayerContext);

  const [backendURL, setBackendURL] = useState(null);

  useEffect(() => {
    (async () => {
      const url = await getBackendURL();
      setBackendURL(url);
    })();
  }, []);

  const generateTrackId = (track) => track.spotify_id || extractSpotifyId(track.url) || `${track.artist}-${track.title}`;
  const isCurrentTrack = currentTrack?.trackId === generateTrackId(track);
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  const spotifyId = extractSpotifyId(track.url) || track.spotify_id;

  useEffect(() => {
    if (!spotifyId || !token || !backendURL) return;

    axios
      .get(`${backendURL}/api/download/check?spotifyId=${spotifyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.downloaded) {
          const url = `${backendURL}/media/${encodeURIComponent(res.data.filePath)}`;
          setFileUrl(url);
          setDownloaded(true);
        }
      })
      .catch(console.error);
  }, [spotifyId, token, backendURL]);

  const handleDownload = async () => {
    if (!track.url) {
      alert('Track URL is undefined, cannot download');
      return;
    }
    if (!backendURL) {
      alert('Backend URL not loaded yet');
      return;
    }

    setIsDownloading(true);
    setProgressText('Starting download...');

    try {
      const res = await axios.post(`${backendURL}/api/download`,
        { url: track.url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { taskId } = res.data;

      eventSourceRef.current = new EventSource(
        `${backendURL}/api/download/progress/${taskId}?token=${token}`
      );

      eventSourceRef.current.onmessage = (event) => {
        const { state, message } = JSON.parse(event.data);
        setProgressText(message);

        if (state === 'finished') {
          eventSourceRef.current.close();
          setIsDownloading(false);
          setDownloaded(true);
          const fileName = `${sanitizeFileName(track.artist)} - ${sanitizeFileName(track.title)}.mp3`;
          setFileUrl(`${backendURL}/media/${encodeURIComponent(fileName)}`);
        } else if (state === 'error') {
          setIsDownloading(false);
          eventSourceRef.current.close();
          alert(`❌ Download failed: ${message}`);
        }
      };

      eventSourceRef.current.onerror = () => {
        setIsDownloading(false);
        if (eventSourceRef.current) eventSourceRef.current.close();
      };
    } catch (err) {
      console.error('Download error:', err);
      alert('Download failed');
      setIsDownloading(false);
    }
  };

  const handlePlay = () => {
    const url = downloaded ? fileUrl : track.url;
    if (!url) return alert('Track is not playable.');
    setQueue(queue);
    playTrack({ ...track, url }, queue);
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl group transition-all overflow-hidden ${
        isCurrentTrack ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white/60 dark:bg-zinc-900/60'
      }`}
    >
      {showIndex && (
        <div className="w-6 text-sm font-bold text-gray-400">{index + 1}</div>
      )}

      <img
        src={track.cover || '/default_cover.jpg'}
        alt={track.title}
        className="w-14 h-14 object-cover rounded-md shadow"
      />

      <div className="flex-grow min-w-0 overflow-hidden">
        <h3 className="font-semibold text-zinc-800 dark:text-white truncate">{track.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {track.artist} • {track.album} • {formatDuration(track.duration)}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {downloaded ? (
          <button
            onClick={handlePlay}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition ${
              isCurrentlyPlaying ? 'bg-green-500 text-white' : 'bg-indigo-500 text-white'
            }`}
            title="Play"
          >
            <Play size={16} fill="currentColor" />
          </button>
        ) : isDownloading ? (
          <div
            className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-2 animate-pulse"
            title={progressText}
          >
            <Loader2 size={14} className="animate-spin" />
            {progressText}
          </div>
        ) : (
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
            title="Download"
          >
            <Download size={14} />
          </button>
        )}

      </div>
    </div>
  );
};

export default TrackRow;
