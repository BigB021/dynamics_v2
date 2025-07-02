import { createContext, useState, useRef, useEffect } from 'react';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1); // index in queue
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const audioInstanceRef = useRef(null);

  // Derived value
  const currentTrack = currentIndex >= 0 && currentIndex < queue.length
    ? queue[currentIndex]
    : null;

  // Safely set current track by index
  const setCurrentTrackByIndex = (index) => {
    if (index >= 0 && index < queue.length) {
      setCurrentIndex(index);
    }
  };

  // Safely set current track by track object
  const setCurrentTrack = (track) => {
    if (!track) {
      setCurrentIndex(-1);
      return;
    }
    const foundIndex = queue.findIndex(
      (t) =>
        t.url === track.url &&
        t.title === track.title &&
        t.artist === track.artist
    );
    if (foundIndex !== -1) {
      setCurrentIndex(foundIndex);
    } else {
      // If track not in queue, append it
      setQueue((prev) => [...prev, track]);
      setCurrentIndex(queue.length); // new index at the end
    }
  };

  const playNext = ({ shuffle = false } = {}) => {
    if (queue.length === 0) return;

    if (shuffle) {
      let next;
      do {
        next = Math.floor(Math.random() * queue.length);
      } while (next === currentIndex && queue.length > 1);
      setCurrentIndex(next);
    } else {
      setCurrentIndex((prev) =>
        prev + 1 >= queue.length ? 0 : prev + 1
      );
    }
  };

  const playPrevious = () => {
    if (queue.length === 0) return;

    setCurrentIndex((prev) =>
      prev - 1 < 0 ? queue.length - 1 : prev - 1
    );
  };

  useEffect(() => {
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
    currentIndex,
    setCurrentTrack,
    setCurrentTrackByIndex,
    queue,
    setQueue,
    playNext,
    playPrevious,
    isPlayerReady,
    setIsPlayerReady,
    audioInstanceRef,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
