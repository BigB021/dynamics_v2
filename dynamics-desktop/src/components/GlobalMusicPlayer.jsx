import React, { useEffect, useRef, useState, useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
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
  const { currentTrack, setCurrentTrack } = useContext(PlayerContext);

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one
  const [loadedTrackId, setLoadedTrackId] = useState(null); // Track which track is currently loaded
  const [isLoading, setIsLoading] = useState(false); // Prevent multiple simultaneous loads

  // Create a unique ID for tracks to compare them
  const getTrackId = (track) => {
    if (!track) return null;
    return `${track.url}-${track.title}-${track.artist}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || !currentTrack.url) {
      if (!currentTrack) {
        setLoadedTrackId(null);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setIsLoading(false);
      }
      return;
    }

    const currentTrackId = getTrackId(currentTrack);
    
    // Only reload and play if it's a different track and not currently loading
    if (currentTrackId !== loadedTrackId && !isLoading) {
      setIsLoading(true);
      
      const playAudio = async () => {
        try {
          // Stop current audio first
          audio.pause();
          audio.currentTime = 0;
          
          // Load new track
          audio.src = currentTrack.url;
          audio.load();
          
          // Update loaded track ID
          setLoadedTrackId(currentTrackId);
          
          // Only auto-play if this is a track change, not initial load on navigation
          if (loadedTrackId !== null) {
            await audio.play();
            setIsPlaying(true);
          } else {
            // First load - don't auto-play, just prepare
            setIsPlaying(false);
          }
        } catch (err) {
          console.error('Audio play error:', err);
          setIsPlaying(false);
        } finally {
          setIsLoading(false);
        }
      };

      playAudio();
    } else if (currentTrackId === loadedTrackId && audio.src) {
      // Same track, just sync the playing state without reloading
      setIsPlaying(!audio.paused);
    }

    return () => {
      // Only cleanup if component is unmounting or track is being cleared
      if (!currentTrack && audio) {
        audio.pause();
        audio.src = '';
        setLoadedTrackId(null);
        setIsLoading(false);
      }
    };
  }, [currentTrack, loadedTrackId, isLoading]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      // Handle repeat modes
      if (repeatMode === 2) { // Repeat one
        audio.currentTime = 0;
        audio.play().then(() => setIsPlaying(true)).catch(console.error);
      } else if (repeatMode === 1) { // Repeat all - would need queue implementation
        // This would require queue functionality from context
        audio.currentTime = 0;
        audio.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    };

    const handleLoadStart = () => {
      // Track is starting to load
    };

    const handleCanPlay = () => {
      // Track is ready to play
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    // Add event listeners
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);

    // Set initial duration if already loaded
    if (!isNaN(audio.duration)) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [currentTrack, repeatMode]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || isLoading) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // Check if we need to reload the track
        const currentTrackId = getTrackId(currentTrack);
        if (currentTrackId !== loadedTrackId || audio.src === '' || audio.src !== currentTrack.url) {
          setIsLoading(true);
          audio.src = currentTrack.url;
          audio.load();
          setLoadedTrackId(currentTrackId);
          
          // Wait for audio to be ready
          await new Promise((resolve, reject) => {
            const onCanPlay = () => {
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              resolve();
            };
            const onError = () => {
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              reject(new Error('Audio load failed'));
            };
            audio.addEventListener('canplay', onCanPlay);
            audio.addEventListener('error', onError);
          });
          
          setIsLoading(false);
        }
        
        await audio.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Toggle play error:', err);
      setIsPlaying(false);
      setIsLoading(false);
    }
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
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
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

  const formatTime = (time) => {
    if (isNaN(time) || time === null || time === undefined) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const cycleRepeat = () => {
    setRepeatMode((prev) => (prev + 1) % 3);
  };

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
  };

  if (!currentTrack) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 theme-${theme} z-50 animate-in slide-in-from-bottom duration-500`}>
      <div className="border-t shadow-2xl bg-[var(--glass)]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center border shadow-lg bg-[var(--glass)]">
                {currentTrack.cover ? (
                  <img src={currentTrack.cover} alt="Album art" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Music className="w-8 h-8 text-[color:var(--text-muted)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-lg text-[color:var(--text)] truncate">{currentTrack.title}</h3>
                <p className="text-sm text-[color:var(--text-muted)] truncate">{currentTrack.artist}</p>
                {currentTrack.album && (
                  <p className="text-xs text-[color:var(--text-muted)] truncate opacity-75">{currentTrack.album}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsLiked(!isLiked)} 
                className={`p-3 rounded-full transition-all duration-200 ${
                  isLiked 
                    ? 'text-cyan-400 bg-cyan-500/20' 
                    : 'text-[color:var(--text-muted)] hover:text-blue-400 hover:bg-white/10'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              <button 
                onClick={() => setIsShuffled(!isShuffled)} 
                className={`p-3 rounded-full transition-all duration-200 ${
                  isShuffled 
                    ? 'text-cyan-400 bg-cyan-500/20' 
                    : 'text-[color:var(--text-muted)] hover:text-blue-400 hover:bg-white/10'
                }`}
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button className="p-3 rounded-full text-[color:var(--text-muted)] hover:text-blue-400 hover:bg-white/10">
                <SkipBack className="w-6 h-6" />
              </button>

              <button
                onClick={togglePlay}
                className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!currentTrack || isLoading}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </button>

              <button className="p-3 rounded-full text-[color:var(--text-muted)] hover:text-blue-400 hover:bg-white/10">
                <SkipForward className="w-6 h-6" />
              </button>

              <button
                onClick={cycleRepeat}
                className={`relative p-3 rounded-full transition-all duration-200 ${
                  repeatMode > 0 
                    ? 'text-cyan-400 bg-cyan-500/20' 
                    : 'text-[color:var(--text-muted)] hover:text-blue-400 hover:bg-white/10'
                }`}
              >
                <Repeat className="w-5 h-5" />
                {repeatMode === 2 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full text-xs flex items-center justify-center text-white">
                    1
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-4 min-w-0">
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleMute} 
                  className="p-2 rounded-full text-[color:var(--text-muted)] hover:text-blue-400 hover:bg-white/10"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 bg-[var(--progress)] rounded-full appearance-none cursor-pointer slider"
                />
              </div>
              <button 
                onClick={handleClose} 
                className="p-2 rounded-full text-[color:var(--text-muted)] hover:text-white hover:bg-red-500/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-[color:var(--text-muted)] min-w-[40px]">{formatTime(currentTime)}</span>
            <div
              className="flex-1 h-2 rounded-full cursor-pointer overflow-hidden shadow-inner bg-[var(--progress)]"
              onClick={handleProgressClick}
            >
              <div className="relative w-full h-2 bg-violet-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-purple-500"
                  style={{
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                    transition: 'width 0.2s linear',
                  }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-500 shadow"
                  style={{
                    left: `calc(${duration ? (currentTime / duration) * 100 : 0}% - 6px)`,
                    transition: 'left 0.2s linear',
                  }}
                />
              </div>
            </div>
            <span className="text-sm text-[color:var(--text-muted)] min-w-[40px]">{formatTime(duration)}</span>
          </div>
        </div>
        <audio ref={audioRef} />
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default GlobalMusicPlayer;