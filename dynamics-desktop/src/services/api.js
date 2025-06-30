import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api', 
});

export const searchTracks = (query) => API.get(`/search?q=${query}`);
export const downloadTrack = (url) => API.post('/download', { url });
