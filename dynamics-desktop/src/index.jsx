import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <PlayerProvider>
          <FavoritesProvider>
            <App />
          </FavoritesProvider>
        </PlayerProvider>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
