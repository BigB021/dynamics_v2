import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Add request interceptor to include the Authorization header
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Or sessionStorage if you prefer
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API calls
export const searchTracks = (query) => API.get(`/search?q=${encodeURIComponent(query)}`);
export const downloadTrack = (url) => API.post('/download', { url });

export default API;
