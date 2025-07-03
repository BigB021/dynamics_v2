import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { Play, Download, Loader2 } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';

const extractSpotifyId = (url) => {
  const match = url.match(/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
};

const sanitizeFileName = (name) =>
  name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim();

const SearchResultItem = ({ track, onPlay }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const eventSourceRef = useRef(null);
  const { setCurrentTrack } = useContext(PlayerContext);

  const spotifyId = extractSpotifyId(track.url);

  useEffect(() => {
    if (!spotifyId) return;

    axios
      .get(`http://localhost:3000/api/download/check?spotifyId=${spotifyId}`)
      .then((res) => {
        if (res.data.downloaded) {
          setDownloaded(true);
          setFileUrl(`http://localhost:3000/media/${encodeURIComponent(res.data.filePath)}`);
        }
      })
      .catch(console.error);
  }, [track.url, track.artist, track.name, spotifyId]);

  const handleDownload = async () => {
    setIsDownloading(true);
    setProgressText('Starting download...');

    try {
      const res = await axios.post('http://localhost:3000/api/download', { url: track.url });
      const { taskId } = res.data;

      eventSourceRef.current = new EventSource(
        `http://localhost:3000/api/download/progress/${taskId}`
      );

      eventSourceRef.current.onmessage = (event) => {
        const { state, message } = JSON.parse(event.data);
        setProgressText(message);

        if (state === 'finished') {
          setIsDownloading(false);
          eventSourceRef.current.close();
          setDownloaded(true);
          const fileName = `${sanitizeFileName(track.artist)} - ${sanitizeFileName(track.name)}.mp3`;
          setFileUrl(`http://localhost:3000/media/${encodeURIComponent(fileName)}`);
        } else if (state === 'error') {
          setIsDownloading(false);
          eventSourceRef.current.close();
          alert(`❌ Download failed for "${track.name}": ${message}`);
        }
      };

      eventSourceRef.current.onerror = () => {
        setIsDownloading(false);
        if (eventSourceRef.current) eventSourceRef.current.close();
      };
    } catch (err) {
      console.error('Download error:', err);
      setIsDownloading(false);
      alert('Failed to start download');
    }
  };

  const handlePlay = () => {
    if (fileUrl) {
      setCurrentTrack({
        artist: track.artist,
        title: track.name,
        url: fileUrl,
        cover: track.cover || '/default_cover.jpg',
      });
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 shadow rounded-xl hover:shadow-md transition-all">
      <img
        src={track.cover || '/default_cover.jpg'}
        alt={`${track.name} cover`}
        className="w-16 h-16 rounded-lg object-cover shadow-sm"
      />

      <div className="flex-grow min-w-0">
<h3 className="font-semibold text-zinc-800 dark:text-white truncate flex items-center gap-2">
  {track.name}
  {track.explicit && (
    <span className="text-xs font-semibold bg-zinc-800 text-white px-1.5 py-0.5 rounded">
      E
    </span>
  )}
</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
          {track.artist} <span className="italic text-xs ml-1">({track.album || 'Unknown Album'})</span>
        </p>
      </div>

      <div className="flex-shrink-0">
        {downloaded ? (
          <button
            onClick={handlePlay}
            className="w-10 h-10 flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white rounded-full"
            title="Play"
          >
            <Play size={18} />
          </button>
        ) : isDownloading ? (
          <div
            className="relative w-10 h-10 flex items-center justify-center text-green-600"
            title={progressText}
          >
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-700 hover:bg-green-800 text-white rounded-full shadow"
          >
            <Download size={22} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchResultItem;
