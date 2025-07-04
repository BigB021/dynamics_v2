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
  ChevronLeft
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.png';

const VerticalNavbar = ({ onToggle }) => {
  const { user, logout } = useContext(AuthContext);
  const [active, setActive] = useState('');
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

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

  const navItem = (to, label, icon) => (
    <Link
      to={to}
      onClick={() => setActive(to)}
      className={`group flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 w-full text-left relative overflow-hidden ${
        active === to
          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg transform scale-105'
          : 'text-slate-600 dark:text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-indigo-500/20 hover:scale-105'
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
      className={`fixed top-0 left-0 h-full ${
        expanded ? 'w-56' : 'w-20'
      } bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-800 shadow-2xl border-r border-slate-200/50 dark:border-zinc-700/50 z-40 px-4 py-6 flex flex-col justify-between transition-all duration-300`}
    >
      {/* Top Section */}
      <div className="space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-zinc-700">
          <img
            src={logo}
            alt="Logo"
            className="w-10 h-10 rounded-xl object-cover"
          />
          {expanded && (
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">Dynamics</h1>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItem('/', 'Home', <Home size={22} />)}
          {navItem('/downloads', 'Downloads', <Download size={22} />)}
          {navItem('/favorites', 'Favorites', <Heart size={22} />)}
          {navItem('/playlists', 'Playlists', <ListMusic size={22} />)}
          {navItem('/albums', 'Albums', <DiscAlbum size={22} />)}
        </nav>
        
      </div>

      {/* Bottom Section */}
      <div className="space-y-4">
        {/* Profile */}
        <Link
          to="/profile"
          className="flex items-center gap-3 w-full text-left hover:bg-white dark:hover:bg-zinc-700 p-1 rounded-xl transition-all duration-300 hover:scale-105 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700"
        >
          {user.profile_picture ? (
            <img
              src={`http://localhost:3000/media/${user.profile_picture}`}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
          )}
          {expanded && (
            <div className="flex-1">
              <p className="font-semibold text-slate-800 dark:text-white">{user.username}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">View Profile</p>
            </div>
          )}
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-3 rounded-xl transition-all duration-300 w-full hover:scale-105 group"
        >
          <LogOut size={22} className="group-hover:scale-110 transition-transform" />
          {expanded && <span className="font-semibold">Logout</span>}
        </button>

        {/* Toggle Button (Bottom Left Corner) */}
        <button
          onClick={toggleSidebar}
          className="w-full flex justify-center items-center py-2 rounded-xl border border-slate-300 dark:border-zinc-600 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all duration-200"
        >
          {expanded ? <ChevronLeft size={22} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </div>
  );
};

export default VerticalNavbar;
