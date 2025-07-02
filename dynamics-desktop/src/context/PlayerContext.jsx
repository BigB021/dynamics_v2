import { createContext, useState, useRef, useEffect } from 'react';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const audioInstanceRef = useRef(null); // Track the audio instance globally

  // Prevent multiple instances of the same track
  const setCurrentTrackSafe = (track) => {
    if (track && currentTrack && 
        track.url === currentTrack.url && 
        track.title === currentTrack.title && 
        track.artist === currentTrack.artist) {
      // Same track, don't reload
      return;
    }
    setCurrentTrack(track);
  };

  // Global audio state management
  useEffect(() => {
    // Ensure only one audio instance can play at a time
    const handleBeforeUnload = () => {
      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause();
        audioInstanceRef.current.src = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause();
        audioInstanceRef.current.src = '';
      }
    };
  }, []);

  const value = {
    currentTrack,
    setCurrentTrack: setCurrentTrackSafe,
    queue,
    setQueue,
    isPlayerReady,
    setIsPlayerReady,
    audioInstanceRef
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};