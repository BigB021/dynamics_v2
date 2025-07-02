import React, { useEffect, useState } from 'react';
import { Album } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DownloadedAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/api/albums')
      .then((res) => res.json())
      .then((data) => setAlbums(data))
      .catch(console.error);
  }, []);

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
              key={`${album.name}-${album.artist}`}
              onClick={() => navigate(`/albums/${encodeURIComponent(album.name)}`)}
              className="cursor-pointer bg-white dark:bg-zinc-900 rounded-xl shadow hover:shadow-lg transition-all group"
            >
              <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
                <img
                  src={`${album.cover}`}
                  alt={`${album.name} cover`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-white truncate">{album.name}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{album.artist}</p>
                {album.release_date && (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                    Released: {album.release_date}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DownloadedAlbums;
