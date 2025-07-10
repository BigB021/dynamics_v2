import axios from 'axios';
import { getBackendURL } from '../utils/authFetch';

export const getFavorites = async (token) => {
  const baseURL = await getBackendURL();
  const res = await axios.get(`${baseURL}/api/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const toggleFavorite = async (spotifyId, isLiked, token) => {
  try {
    const baseURL = await getBackendURL();
    if (isLiked) {
      // DELETE uses the URL param
      const res = await axios.delete(`${baseURL}/api/favorites/${spotifyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.status === 200;
    } else {
      // POST should send the ID in the body
      const res = await axios.post(`${baseURL}/api/favorites`, { spotifyId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.status === 200 || res.status === 201;
    }
  } catch (err) {
    console.error('toggleFavorite error:', err);
    return false;
  }
};
