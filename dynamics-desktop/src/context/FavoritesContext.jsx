import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { getFavorites, toggleFavorite as apiToggleFavorite } from '../utils/favoritesAPI';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (token) {
      getFavorites(token).then(setFavorites).catch(err => {
        console.error('[FavoritesContext] Failed to fetch favorites:', err);
      });
    } else {
      setFavorites([]);
    }
  }, [token]);

  const isFavorite = (spotifyId) =>
    favorites.some((track) => track.spotify_id === spotifyId);

  const toggleFavorite = async (spotifyId, trackData = null) => {
  const currentlyFavorite = isFavorite(spotifyId);
  const success = await apiToggleFavorite(spotifyId, currentlyFavorite, token);

  if (!success) return false;

  setFavorites((prev) => {
    if (currentlyFavorite) {
      return prev.filter((t) => t.spotify_id !== spotifyId);
    } else {
      if (!trackData) {
        console.warn('Missing track data for new favorite:', spotifyId);
        return prev;
      }
      // Prevent duplicates
      const alreadyExists = prev.some(t => t.spotify_id === spotifyId);
      if (alreadyExists) return prev;
      return [...prev, trackData];
    }
  });

  return true;
};


  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

