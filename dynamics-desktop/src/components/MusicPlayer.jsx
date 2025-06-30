import React from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

export default function MusicPlayer({ track }) {
  if (!track) {
    return (
      <div className="text-center text-gray-500 py-4">
        No track selected
      </div>
    );
  }

  const getTrackUrl = () => {
    // Use local path if downloaded, else fallback to stream
    if (track.localPath) {
      return `http://localhost:3000/media/${encodeURIComponent(track.localPath.split('/').pop())}`;
    } else if (track.streamUrl) {
      return track.streamUrl;
    }
    return null;
  };

  const audioSrc = getTrackUrl();

  return (
    <div className="rounded-xl shadow-md bg-white dark:bg-zinc-900 p-4">
      <div className="text-lg font-semibold text-center mb-2 text-gray-900 dark:text-gray-100">
        {track.artist} - {track.title}
      </div>
      <AudioPlayer
        src={audioSrc}
        autoPlay
        showJumpControls={false}
        layout="horizontal-reverse"
        customAdditionalControls={[]}
        customVolumeControls={[]}
      />
    </div>
  );
}
