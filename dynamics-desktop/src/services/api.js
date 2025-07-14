import axios from 'axios';
import { getBackendURL } from '../utils/authFetch';

let API = null;

// Create or return axios instance with dynamic baseURL
const getAPI = async () => {
  if (API) return API;

  const baseURL = await getBackendURL();

  API = axios.create({
    baseURL: baseURL + '/api',
  });

  API.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return API;
};

export const searchTracks = async (query) => {
  const api = await getAPI();
  return api.get(`/search?q=${encodeURIComponent(query)}`);
};

export const downloadTrack = async (url) => {
  const api = await getAPI();
  return api.post('/download', { url });
};

export default getAPI;