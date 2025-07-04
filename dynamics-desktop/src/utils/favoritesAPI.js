import { authFetch } from '../utils/authFetch';

export async function toggleFavorite(spotifyId, liked) {
  const method = liked ? 'DELETE' : 'POST';
  const url = liked ? `/api/favorites/${spotifyId}` : `/api/favorites`;
  const body = liked ? null : JSON.stringify({ spotifyId });

  const res = await authFetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  return res.ok;
}

export async function isTrackFavorite(spotifyId) {
  const res = await authFetch(`/api/favorites/${spotifyId}`);
  const data = await res.json();
  return data.isFavorite;
}
