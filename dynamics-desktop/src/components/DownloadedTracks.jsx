import React, { useEffect, useState } from 'react';
import MusicPlayer from './MusicPlayer';

const DownloadedTracks = () => {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/downloaded')
      .then(res => res.json())
      .then(data => setTracks(data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Downloaded Tracks</h2>
      {tracks.length === 0 && <p>No tracks downloaded yet.</p>}
      <ul className="flex flex-col gap-4">
        {tracks.map(track => (
          <li key={track.filename}>
            <MusicPlayer src={track.url} title={track.filename} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DownloadedTracks;
