import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Download,
  Heart,
  ListMusic,
  LogOut,
  DiscAlbum,
  UserCircle,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.png';

const VerticalNavbar = ({ onToggle }) => {
  const { user, logout } = useContext(AuthContext);
  const [active, setActive] = useState('');
  const [expanded, setExpanded] = useState(true);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );
  const location = useLocation();
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

  useEffect(() => {
    setActive(location.pathname);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setExpanded((prev) => {
      const newState = !prev;
      onToggle?.(newState); // notify layout
      return newState;
    });
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  const IconButton = ({ icon, title, onClick }) => (
    <button
      onClick={onClick}
      className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/20 group"
      title={title}
    >
      <div className="group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
    </button>
  );

  const navItem = (to, label, icon) => (
    <Link
      to={to}
      onClick={() => setActive(to)}
      className={`group flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 w-full text-left relative overflow-hidden ${
        active === to
          ? 'bg-gradient-to-r from-purple-500/80 to-indigo-500/80 text-white shadow-lg transform scale-105 backdrop-blur-sm border border-white/20'
          : 'text-slate-600 dark:text-slate-400 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm hover:border-white/20 hover:scale-105 border border-transparent'
      }`}
    >
      <div className={`transition-all duration-300 ${active === to ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      {expanded && (
        <>
          <span className="font-semibold tracking-wide">{label}</span>
          {active === to && <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse" />}
        </>
      )}
    </Link>
  );

  if (!user) return null;

  return (
    <div
      className={`fixed top-0 left-0 ${
        expanded ? 'w-56' : 'w-22'
      } bg-slate-900/20 dark:bg-slate-900/40 backdrop-blur-xl border-r border-white/10 dark:border-white/5 z-40 px-4 py-6 flex flex-col transition-all duration-300 shadow-2xl`}
      style={{ height: '100vh' }}
    >

      {/* Content Container with proper flex layout */}
      <div className="relative z-10 flex flex-col h-full pb-40 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-3rem)] scrollbar-hide">
        {/* Top Section */}
        <div className="flex-none space-y-6 ">
          {/* Logo */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/10 dark:border-white/5">
            <div className="relative">
              <img
                src={logo}
                alt="Logo"
                className="w-10 h-10 rounded-xl object-cover shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl"></div>
            </div>
            {expanded && (
              <div>
                <h1 className="text-lg font-bold text-white drop-shadow-lg">Dynamics</h1>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2 ">
            {navItem('/', 'Home', <Home size={22} />)}
            {navItem('/downloads', 'Downloads', <Download size={22} />)}
            {navItem('/favorites', 'Favorites', <Heart size={22} />)}
            {navItem('/playlists', 'Playlists', <ListMusic size={22} />)}
            {navItem('/albums', 'Albums', <DiscAlbum size={22} />)}
          </nav>

          {/* Theme Toggle */}
          <div className="flex justify-center ">
            <IconButton
              icon={darkMode ? <Sun size={22} className="text-yellow-400" /> : <Moon size={22} className="text-indigo-400" />}
              title="Toggle Theme"
              onClick={toggleTheme}
            />
          </div>
        </div>

        {/* Spacer to push bottom section down */}
        <div className="flex-1 min-h-0 mt-10"></div>

        {/* Bottom Section - Fixed spacing from bottom */}
        <div className="flex-none space-y-4 pb-4">
          {/* Profile */}
          <Link
            to="/profile"
            className="flex items-center gap-3 w-full text-left hover:bg-white/10 dark:hover:bg-white/5 p-1 rounded-xl transition-all duration-300 hover:scale-105 bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/5 backdrop-blur-sm group"
          >
            {user.profile_picture ? (
              <img
                src={`http://localhost:3000/media/${user.profile_picture}`}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-purple-500 shadow-lg"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <UserCircle className="w-6 h-6 text-white" />
              </div>
            )}
            {expanded && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{user.username}</p>
                <p className="text-xs text-slate-300 dark:text-slate-400">View Profile</p>
              </div>
            )}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-400 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/10 p-3 rounded-xl transition-all duration-300 w-full hover:scale-105 group border border-transparent hover:border-red-500/20 backdrop-blur-sm"
          >
            <LogOut size={22} className="group-hover:scale-110 transition-transform" />
            {expanded && <span className="font-semibold">Logout</span>}
          </button>

          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="w-full flex justify-center items-center py-3 rounded-xl border border-white/10 dark:border-white/5 hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 backdrop-blur-sm group hover:border-white/20"
          >
            <div className="group-hover:scale-110 transition-transform duration-300 text-white ">
              {expanded ? <ChevronLeft size={22} /> : <ChevronRight size={20} />}
            </div>
          </button>
        </div>
      </div>

      {/* Additional glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default VerticalNavbar;