import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { toggleFavorite, isTrackFavorite } from '../utils/favoritesAPI';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  Heart,
  Shuffle,
  Repeat,
  Music,
} from 'lucide-react';

const GlobalMusicPlayer = ({ theme = 'dark' }) => {
  const {
    currentTrack,
    playNext,
    playPrevious,
    setCurrentTrack,
    queue,
    audioInstanceRef,
    shouldAutoPlay,
    setShouldAutoPlay
  } = useContext(PlayerContext);

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const [loadedTrackId, setLoadedTrackId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getTrackId = useCallback((track) => 
    track ? `${track.url}-${track.title}-${track.artist}` : null, []);

  // Store audio ref in context for global access
  useEffect(() => {
    if (audioRef.current) {
      audioInstanceRef.current = audioRef.current;
    }
  }, [audioInstanceRef]);

  // Fixed track loading effect with auto-play support
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack ) return;

    const currentTrackId = getTrackId(currentTrack);
    
    // Prevent double loading of same track
    if (currentTrackId === loadedTrackId) {
      return;
    }


    setIsLoading(true);
    
    // Stop current audio if playing
    if (!audio.paused) {
      audio.pause();
    }

    // Clear previous source
    audio.src = '';
    audio.load();

    // Set new source
    audio.src = currentTrack.url;
    
    const handleCanPlay = () => {
      setIsLoading(false);
      setLoadedTrackId(currentTrackId);
      
      // Auto-play if shouldAutoPlay is true OR if user was previously playing
      if (shouldAutoPlay || isPlaying) {
        audio.play().then(() => {
          // Reset the auto-play flag after successful play
          if (shouldAutoPlay) {
            setShouldAutoPlay(false);
          }
        }).catch(err => {
          console.error('Auto-play failed:', err);
          setIsPlaying(false);
          // Reset the auto-play flag even on error
          if (shouldAutoPlay) {
            setShouldAutoPlay(false);
          }
        });
      }
    };

    const handleError = () => {
      console.error('Audio load error for track:', currentTrack.title);
      setIsLoading(false);
      setIsPlaying(false);
      // Reset the auto-play flag on error
      if (shouldAutoPlay) {
        setShouldAutoPlay(false);
      }
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    
    // Load the audio
    audio.load();

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack, getTrackId, loadedTrackId, isPlaying, shouldAutoPlay, setShouldAutoPlay]);

  useEffect(() => {
      if (currentTrack) {
        isTrackFavorite(currentTrack.spotify_id).then(setIsLiked);
      }
    }, [currentTrack]);
  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (!isNaN(audio.duration)) setDuration(audio.duration);
    };

    const onEnded = () => {
      if (repeatMode === 2) {
        audio.currentTime = 0;
        audio.play();
      } else {
        // Auto-play next track when current ends
        setShouldAutoPlay(true);
        playNext({ shuffle: isShuffled });
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [repeatMode, playNext, isShuffled, setShouldAutoPlay]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        console.error('Play error:', err);
        setIsPlaying(false);
      });
    }
  }, [isPlaying, isLoading]);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const cycleRepeat = () => setRepeatMode(prev => (prev + 1) % 3);

  const handleClose = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    setCurrentTrack(null);
    setLoadedTrackId(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setShouldAutoPlay(false);
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-black/60 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-1/3">
            <div className="w-14 h-14 rounded-lg overflow-hidden">
              {currentTrack.cover ? (
                <img src={currentTrack.cover} alt="Album" className="w-full h-full object-cover" />
              ) : <Music className="w-full h-full text-zinc-400" />}
            </div>
            <div className="truncate">
              <div className="text-white font-semibold text-sm truncate">{currentTrack.title}</div>
              <div className="text-zinc-400 text-xs truncate">{currentTrack.artist}</div>
            </div>
            <button
              onClick={async () => {
                const success = await toggleFavorite(currentTrack.spotify_id, isLiked);
                if (success) setIsLiked(!isLiked);
              }}
              className="ml-2 text-pink-500 hover:text-pink-600"
            >
              <Heart
                className="w-5 h-5"
                strokeWidth={isLiked ? 0 : 2}
                fill={isLiked ? 'currentColor' : 'none'}
              />
            </button>
            
          </div>

          <div className="flex flex-col items-center w-1/3">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsShuffled(!isShuffled)} className={isShuffled ? 'text-white' : 'text-zinc-500 hover:text-white'}>
                <Shuffle className="w-5 h-5" />
              </button>
              <button onClick={playPrevious} className="text-zinc-500 hover:text-white">
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              <button onClick={() => {
                setShouldAutoPlay(true);
                playNext({ shuffle: isShuffled });
              }} className="text-zinc-500 hover:text-white">
                <SkipForward className="w-6 h-6" />
              </button>
              <button onClick={cycleRepeat} className={repeatMode ? 'text-white' : 'text-zinc-500 hover:text-white'}>
                <Repeat className="w-5 h-5" />
                {repeatMode === 2 && <span className="absolute -top-1 -right-1 text-xs">1</span>}
              </button>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-zinc-400">{formatTime(currentTime)}</span>
              <div onClick={handleProgressClick} className="flex-1 h-1 bg-zinc-700 rounded cursor-pointer">
                <div className="h-full bg-white rounded" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
              </div>
              <span className="text-xs text-zinc-400">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end w-1/3">
            <button onClick={toggleMute} className="text-zinc-500 hover:text-white">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer"
            />
            <button onClick={handleClose} className="text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <audio ref={audioRef} preload="metadata" />
      </div>
    </div>
  );
};

export default GlobalMusicPlayer;