import  { useContext, useState, useEffect } from 'react';
import { Moon, Sun, Settings, Menu, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { AuthContext } from '../context/AuthContext';

const Header = ({ query, setQuery }) => {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { token } = useContext(AuthContext);
  const isLoggedIn = !!token;

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

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // 👉 Don't render header at all if logged in
  if (isLoggedIn) return null;

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-700 shadow-sm sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo" className="w-10 h-10 rounded" />
        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-300 tracking-tight hidden sm:inline">
          Dynamics
        </span>
      </div>

      {/* Desktop Guest Navigation */}
      <div className="hidden sm:flex items-center gap-4">
        <NavIcon icon={<Home size={18} />} label="Home" onClick={() => handleNavigate('/')} />
        <NavIcon
          icon={<Settings size={18} />}
          label="Settings"
          onClick={() => handleNavigate('/settings')}
        />
        <button
          onClick={() => handleNavigate('/login')}
          className="text-sm px-3 py-1 rounded-md text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900"
        >
          Login
        </button>
        <button
          onClick={() => handleNavigate('/register')}
          className="text-sm px-3 py-1 rounded-md text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900"
        >
          Register
        </button>
        <IconButton
          icon={darkMode ? <Sun size={18} /> : <Moon size={18} />}
          title="Toggle Theme"
          onClick={toggleTheme}
        />
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="sm:hidden p-2 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu size={22} />
      </button>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-[72px] right-4 w-56 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 flex flex-col z-50 sm:hidden">
          <MobileItem icon={<Home size={18} />} label="Home" onClick={() => handleNavigate('/')} />
          <MobileItem icon={<Settings size={18} />} label="Settings" onClick={() => handleNavigate('/settings')} />
          <MobileItem icon={null} label="Login" onClick={() => handleNavigate('/login')} />
          <MobileItem icon={null} label="Register" onClick={() => handleNavigate('/register')} />
          <MobileItem
            icon={darkMode ? <Sun size={18} /> : <Moon size={18} />}
            label="Toggle Theme"
            onClick={toggleTheme}
          />
        </div>
      )}
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

const MobileItem = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 text-zinc-700 dark:text-zinc-200 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-sm"
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default Header;