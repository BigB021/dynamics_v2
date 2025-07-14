import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Validate token
const isValidToken = (token) => {
  return token && token !== 'null' && token !== 'undefined';
};

// Get backend URL (dynamic for Electron or fallback to Vite env)
export const getBackendURL = async () => {
  if (window.electronAPI?.getBackendURL) {
    return await window.electronAPI.getBackendURL();
  } else {
    return import.meta.env.VITE_BACKEND_URL;
  }
};

// Hook for React components
export const useAuthFetch = () => {
  const { token } = useContext(AuthContext);

  return async (url, options = {}) => {
    const headers = {
      ...(options.headers || {}),
    };

    if (isValidToken(token)) {
      headers.Authorization = `Bearer ${token}`;
    }

    const baseUrl = await getBackendURL();
    const fetchUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    return fetch(fetchUrl, { ...options, headers });
  };
};

// General-purpose authFetch (outside components)
export const authFetch = async (url, options = {}) => {
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

  const baseUrl = await getBackendURL();
  const fetchUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  console.log('fetch url:', fetchUrl);
  return fetch(fetchUrl, { ...options, headers });
};