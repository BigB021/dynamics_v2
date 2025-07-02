import React, { useEffect, useState } from 'react';
import { List,Moon, Sun, Download, Home, Settings, Search as SearchIcon } from 'lucide-react';
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
<header className="flex items-center justify-between px-6 py-3 bg-gradient-to-br from-slate-50/50 via-blue-50 to-indigo-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 text-zinc-900 dark:text-white border-b dark:border-zinc-700 shadow-sm">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo" className="w-10 h-10" />
        <span className="font-bold text-lg tracking-tight">Dynamics</span>
      </div>

      

      {/* Right: Theme & Actions */}
      <div className="flex items-center gap-4">
        <NavIcon icon={<Home size={18} />} label="Home" onClick={() => navigate('/')} />
        <NavIcon icon={<Download size={18} />} label="Downloads" onClick={() => navigate('/downloads')} />
        <NavIcon icon={<List size={18} />} label="Playlists" onClick={() => navigate('/playlists')} />

        <button
          onClick={toggleTheme}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
          title="Toggle theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="p-2 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 transition" title="Settings">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};

const NavIcon = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 transition text-sm"
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default Header;
