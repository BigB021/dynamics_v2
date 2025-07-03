import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Download, Loader2, Play } from 'lucide-react';
import TrackRow from '../components/TrackRow';
import { PlayerContext } from '../context/PlayerContext';

const AlbumPreviewPage = () => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const eventSourceRef = useRef(null);

  const { setQueue, playTrack } = useContext(PlayerContext);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/album/${id}`);
        setAlbum(res.data.album);
        setTracks(res.data.tracks);
      } catch (err) {
        console.error('Failed to load album:', err);
      }
    };
    fetchAlbum();
  }, [id]);

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      const res = await axios.post('http://localhost:3000/api/download', {
        url: `https://open.spotify.com/album/${id}`,
      });
      const { taskId } = res.data;

      eventSourceRef.current = new EventSource(`http://localhost:3000/api/download/progress/${taskId}`);

      eventSourceRef.current.onmessage = (event) => {
        const { state, message } = JSON.parse(event.data);
        console.log(message);

        if (state === 'finished') {
          eventSourceRef.current.close();
          setIsDownloadingAll(false);
          alert('✅ Album download finished!');
        } else if (state === 'error') {
          eventSourceRef.current.close();
          setIsDownloadingAll(false);
          alert('❌ Album download failed.');
        }
      };

      eventSourceRef.current.onerror = () => {
        setIsDownloadingAll(false);
        if (eventSourceRef.current) eventSourceRef.current.close();
      };
    } catch (err) {
      console.error('Album download error:', err);
      setIsDownloadingAll(false);
    }
  };

  const handlePlayAll = () => {
    if (!tracks.length) return;
    playTrack(tracks[0], tracks);
    setQueue(tracks);
  };

  if (!album) {
    return (
      <div className="text-center p-10">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-600" />
        <p>Loading album...</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-start gap-6 mb-10">
        <img src={album.cover} alt={album.name} className="w-40 h-40 rounded-lg shadow-md" />
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{album.name}</h1>
          <p className="text-zinc-600 dark:text-zinc-400">{album.artist}</p>
          <p className="text-sm text-gray-500 mt-2">
            Released: {album.releaseDate} • {album.totalTracks} tracks
          </p>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handlePlayAll}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow"
            >
              <Play className="inline-block mr-2" size={18} /> Play All
            </button>

            <button
              onClick={handleDownloadAll}
              disabled={isDownloadingAll}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow disabled:opacity-50"
            >
              <Download className="inline-block mr-2" size={18} /> {isDownloadingAll ? 'Downloading...' : 'Download Album'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {tracks.map((track, index) => (
          <TrackRow
            key={track.id}
            track={track}
            queue={tracks}
            showIndex={true}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default AlbumPreviewPage;
