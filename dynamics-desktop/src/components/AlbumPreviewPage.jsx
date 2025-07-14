import { useEffect, useState, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Download, Loader2, Play } from 'lucide-react';
import TrackRow from '../components/TrackRow';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import { getBackendURL } from '../utils/authFetch';

const AlbumPreviewPage = () => {
  const { spotify_id } = useParams();
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);
  const { setQueue, playTrack } = useContext(PlayerContext);
  const { token } = useContext(AuthContext); 

  useEffect(() => {
    if (!token) return;

    const fetchAlbum = async () => {
      setError(null);
      try {
        const BACKEND_URL = await getBackendURL();
        const res = await axios.get(
          `${BACKEND_URL}/api/preview/album/${spotify_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAlbum(res.data.album);
        setTracks(res.data.tracks || []);
      } catch (err) {
        console.error('Failed to load album:', err);
        setError('Failed to load album data.');
      }
    };

    fetchAlbum();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [spotify_id, token]);

  const handleDownloadAll = async () => {
    if (!album || !token) return;

    setIsDownloadingAll(true);
    setError(null);

    try {
      const BACKEND_URL = await getBackendURL();
      const res = await axios.post(
        `${BACKEND_URL}/api/download`,
        {
          url: `https://open.spotify.com/album/${spotify_id}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { taskId } = res.data;
      eventSourceRef.current = new EventSource(
        `${BACKEND_URL}/api/download/progress/${taskId}?token=${token}`
      );


      eventSourceRef.current.onmessage = (event) => {
        const { state, message } = JSON.parse(event.data);
        console.log(`[Download progress] ${message}`);

        if (state === 'finished') {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
          setIsDownloadingAll(false);
          alert('✅ Album download finished!');
        } else if (state === 'error') {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
          setIsDownloadingAll(false);
          alert('❌ Album download failed.');
        }
      };

      eventSourceRef.current.onerror = () => {
        setIsDownloadingAll(false);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
      };
    } catch (err) {
      console.error('Album download error:', err);
      setError('Album download failed.');
      setIsDownloadingAll(false);
    }
  };

  const handlePlayAll = () => {
    if (!tracks.length) return;
    playTrack(tracks[0], tracks);
    setQueue(tracks);
  };

  if (error) {
    return (
      <div className="text-center p-10 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

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
        <img
          src={album.cover}
          alt={album.name}
          className="w-40 h-40 rounded-lg shadow-md object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{album.name}</h1>
          <p className="text-zinc-600 dark:text-zinc-400">{album.artist}</p>
          <p className="text-sm text-gray-500 mt-2">
            Released: {album.release_date} • {tracks.length} tracks
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
              {isDownloadingAll ? (
                <>
                  <Loader2 className="inline-block mr-2 animate-spin" size={18} /> Downloading...
                </>
              ) : (
                <>
                  <Download className="inline-block mr-2" size={18} /> Download Album
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-zinc-400">
          No tracks available for this album.
        </div>
      ) : (
        <div className="grid gap-3">
          {tracks.map((track, index) => (
            <TrackRow
              key={track.spotify_id || track.id || index}
              track={track}
              queue={tracks}
              showIndex={true}
              index={index + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumPreviewPage;