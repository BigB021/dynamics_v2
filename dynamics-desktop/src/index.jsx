import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <FavoritesProvider>
        <HashRouter>
          <PlayerProvider>
              <App />
          </PlayerProvider>
        </HashRouter>
      </FavoritesProvider>

    </AuthProvider>
  </React.StrictMode>
);