// utils/authFetch.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// 🔁 Validate token value
const isValidToken = (token) => {
  return token && token !== 'null' && token !== 'undefined';
};

// ✅ Hook version for React components
export const useAuthFetch = () => {
  const { token } = useContext(AuthContext);

  return (url, options = {}) => {
    const headers = {
      ...(options.headers || {}),
    };

    if (isValidToken(token)) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(url, { ...options, headers });
  };
};

// ✅ Non-hook version (e.g., for AuthContext or outside components)
export const authFetch = (url, options = {}) => {
  let token = localStorage.getItem('token');

  if (!isValidToken(token)) {
    token = null;
  }

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
};
