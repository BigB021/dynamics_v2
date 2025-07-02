import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext'; // update with your path

const PlaylistDetail = () => {
  const { id } = useParams();
  const [tracks, setTracks] = useState([]);

  const { setCurrentTrack, setQueue } = useContext(PlayerContext); 

  useEffect(() => {
    fetch(`http://localhost:3000/api/playlists/${id}`)
      .then(res => res.json())
      .then(data => {
          console.log("Playlist tracks:", data); 

          const enriched = data
          .filter(track => track.file_path)
          .map(track => ({
            ...track,
            url: `http://localhost:3000/media/${track.file_path.split('/').pop()}`,
            cover: track.cover ? `http://localhost:3000/media/${track.cover}` : null,
          }));

          setTracks(enriched);
        })
      .catch(console.error);
  }, [id]);

  const handlePlay = (track) => {
    setQueue(tracks);     
    setCurrentTrack(track);
    console.log("data: "+ track.cover +"\n " + track.url )

  };


  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Playlist Tracks</h2>
      <ul className="space-y-4">
        {Array.isArray(tracks) && tracks.length > 0 ? (
          tracks.map((track, index) => (
            <li
              key={track.spotify_id}
              onClick={() => handlePlay(track)}
              className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            >
              {track.cover && (
                <img
                  src={track.cover}
                  alt={`${track.title} cover`}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div>
                <div className="font-semibold">{track.title}</div>
                <div className="text-sm text-zinc-500">{track.artist}</div>
              </div>
            </li>
          ))
        ) : (
          <p className="text-zinc-500">No tracks in this playlist.</p>
        )}
      </ul>
    </div>
  );
};

export default PlaylistDetail;
