import axios from 'axios';

export const getFavorites = async (token) => {
  const res = await axios.get('http://localhost:3000/api/favorites', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const toggleFavorite = async (spotifyId, isLiked, token) => {
  try {
    if (isLiked) {
      // DELETE uses the URL param
      const res = await axios.delete(`http://localhost:3000/api/favorites/${spotifyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.status === 200;
    } else {
      // POST should send the ID in the body
      const res = await axios.post(`http://localhost:3000/api/favorites`, {
        spotifyId
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.status === 200 || res.status === 201;
    }
  } catch (err) {
    console.error('toggleFavorite error:', err);
    return false;
  }
};

