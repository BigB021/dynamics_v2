import { useEffect, useState, useContext } from 'react';
import { Album } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 
import { getBackendURL } from '../utils/authFetch';

const DownloadedAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const navigate = useNavigate();
  const { token } = useContext(AuthContext); 

  useEffect(() => {
    if (!token) return;

    const fetchAlbums = async () => {
      try {
        const BACKEND_URL = await getBackendURL();
        const res = await fetch(`${BACKEND_URL}/api/albums`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch albums');

        const data = await res.json();
        console.log('Downloaded albums:', data);
        setAlbums(data);
      } catch (err) {
        console.error('Error fetching albums:', err);
      }
    };

    fetchAlbums();
  }, [token]);

  const handleDelete = async (albumId, albumName) => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to delete the album "${albumName}"?`)) return;

    try {
      const BACKEND_URL = await getBackendURL();
      const res = await fetch(`${BACKEND_URL}/api/albums/${albumId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete album');
      }

      setAlbums((prev) => prev.filter((album) => album.id !== albumId));
    } catch (err) {
      console.error('Error deleting album:', err);
      alert('Failed to delete album. Please try again.');
    }
  };

  return (
    <div className="px-6 py-8">
      <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-white flex gap-2 items-center">
        Downloaded Albums <Album className="w-6 h-6" />
      </h2>

      {albums.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <p className="text-lg">No downloaded albums yet.</p>
          <p className="text-sm mt-2">Download albums to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <div
              key={`${album.id}`}
              className="relative group bg-white dark:bg-zinc-900 rounded-xl shadow hover:shadow-lg transition-all"
            >
              <div
                onClick={() => navigate(`/albums/${encodeURIComponent(album.id)}`)}
                className="cursor-pointer"
              >
                <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
                  <img
                    src={album.cover}
                    alt={`${album.name} cover`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-white truncate">
                    {album.name}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{album.artist}</p>
                  {album.release_date && (
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                      Released: {album.release_date}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(album.id, album.name);
                }}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-full shadow transition-all"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DownloadedAlbums;