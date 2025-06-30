import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MusicPlayer from './MusicPlayer';

const extractSpotifyId = (url) => {
  const match = url.match(/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
};

const SearchResultItem = ({ track }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    const spotifyId = extractSpotifyId(track.url);
    if (!spotifyId) return;

    axios.get(`http://localhost:3000/api/download/check?spotifyId=${spotifyId}`)
      .then(res => {
        if (res.data.downloaded) {
          setDownloaded(true);
        }
      })
      .catch(console.error);
  }, [track.url]);


  const handleDownload = async () => {
    setIsDownloading(true);
    setProgressText('Starting download...');

    try {
      const res = await axios.post('http://localhost:3000/api/download', {
        url: track.url,
        title: track.name,
      });

      const { taskId } = res.data;

      eventSourceRef.current = new EventSource(`http://localhost:3000/api/download/progress/${taskId}`);

      eventSourceRef.current.onmessage = (event) => {
        const { state, message } = JSON.parse(event.data);
        setProgressText(message);

       if (state === 'finished') {
          setIsDownloading(false);
          eventSourceRef.current.close();

          // Optional: recheck backend to confirm
          const spotifyId = extractSpotifyId(track.url);
          axios.get(`http://localhost:3000/api/download/check?spotifyId=${spotifyId}`)
            .then(res => {
              if (res.data.downloaded) {
                setDownloaded(true);
              }
            });
        
          alert(`✅ Download finished for "${track.name}"`);
        }else if (state === 'error') {
          setIsDownloading(false);
          eventSourceRef.current.close();
          alert(`❌ Download failed for "${track.name}": ${message}`);
        }
      };

      eventSourceRef.current.onerror = () => {
        setIsDownloading(false);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      };
    } catch (err) {
      console.error('Download error:', err);
      setIsDownloading(false);
      alert('Failed to start download');
    }
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-white shadow rounded-md hover:bg-gray-50">
        {/* ... cover, track info ... */}

      {track.cover && (
        <img
          src={track.cover}
          alt={`${track.name} cover`}
          className="w-16 h-16 rounded object-cover"
        />
      )}
      <div className="flex flex-col flex-grow">
        <h3 className="font-semibold text-lg">{track.name}</h3>
        <p className="text-sm text-gray-600">
          {track.artist} — <span className="italic">{track.album}</span>
        </p>
      </div>
      {downloaded ? (
        <button disabled className="px-3 py-1 bg-gray-400 text-white rounded cursor-default">
          Downloaded
        </button>
      ) : isDownloading ? (
        <button disabled className="relative w-10 h-10 rounded-full border-4 border-green-600 border-t-transparent animate-spin" title={progressText}>
          {/* spinner */}
        </button>
      ) : (
        <button onClick={handleDownload} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
          Download
        </button>
      )}

      {downloaded && (
        <MusicPlayer
          src={`http://localhost:3000/media/${track.artist} - ${track.name}.mp3`}
          title={`${track.artist} - ${track.name}`}
        />
      )}


      
    </div>
  );
};

export default SearchResultItem;
