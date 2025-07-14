import { createContext, useState, useEffect, useContext } from 'react';
import { getFavorites, toggleFavorite as apiToggleFavorite } from '../utils/favoritesAPI';
import { AuthContext } from './AuthContext';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!token) return;
    fetchFavorites();
  }, [token]);

  const fetchFavorites = async () => {
    try {
      const favs = await getFavorites(token);
      setFavorites(favs);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  const isFavorite = (spotifyId) => {
    return favorites.some((t) => t.spotify_id === spotifyId);
  };

  const toggleFavorite = async (spotifyId, track = null) => {
    const liked = isFavorite(spotifyId);
    const success = await apiToggleFavorite(spotifyId, liked, token);
    if (!success) return false;

    setFavorites((prev) => {
      if (liked) {
        // Remove by ID — new array
        return prev.filter((t) => t.spotify_id !== spotifyId);
      } else {
        if (!track) return prev; // Safety
        // Avoid duplicate ID in case track already exists
        const withoutDuplicate = prev.filter((t) => t.spotify_id !== spotifyId);
        return [...withoutDuplicate, track];
      }
    });

    return true;
  };

  const refreshFavorites = fetchFavorites;

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, refreshFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};