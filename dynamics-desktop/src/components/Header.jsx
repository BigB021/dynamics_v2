import React, { useEffect, useState } from 'react';
import {
  List,
  Moon,
  Sun,
  Download,
  Home,
  Settings,
  ListMusic,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Header = ({ query, setQuery }) => {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-700 shadow-sm sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo" className="w-10 h-10 rounded" />
        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-300 tracking-tight">
          Dynamics
        </span>
      </div>

      {/* Navigation + Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        <NavIcon icon={<Home size={18} />} label="Home" onClick={() => navigate('/')} />
        <NavIcon icon={<Download size={18} />} label="Downloads" onClick={() => navigate('/downloads')} />
        <NavIcon icon={<List size={18} />} label="Playlists" onClick={() => navigate('/playlists')} />
        <NavIcon icon={<ListMusic size={18} />} label="Albums" onClick={() => navigate('/albums')} />
        <NavIcon icon={<Heart size={18} />} label="Favorites" onClick={() => navigate('/favorites')} />

        <div className="flex items-center gap-2 border-l pl-4 border-zinc-300 dark:border-zinc-600 ml-2">
          <IconButton
            icon={darkMode ? <Sun size={18} /> : <Moon size={18} />}
            title="Toggle Theme"
            onClick={toggleTheme}
          />
          <IconButton
            icon={<Settings size={18} />}
            title="Settings"
            onClick={() => navigate('/settings')}
          />
        </div>
      </div>
    </header>
  );
};

const NavIcon = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-300 transition text-sm"
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const IconButton = ({ icon, title, onClick }) => (
  <button
    onClick={onClick}
    className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
    title={title}
  >
    {icon}
  </button>
);

export default Header;
