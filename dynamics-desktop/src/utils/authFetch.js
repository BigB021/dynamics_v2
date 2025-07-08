// utils/authFetch.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Validate token value
const isValidToken = (token) => {
  return token && token !== 'null' && token !== 'undefined';
};

// Hook version for React components
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

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
  
  const fetchUrl = url.startsWith('http') ? url : BACKEND_URL + url;

  console.log("fetch url: "+fetchUrl);

  return fetch(fetchUrl, { ...options, headers });
};
