import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Moon, Sun, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../services/api';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse user locally (updates every time the URL/location changes)
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch(e) {}
    navigate('/login');
  };

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary-600 group">
          <Activity className="w-8 h-8 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-xl tracking-wide text-gray-900 dark:text-white">Survey Quest</span>
        </Link>
        
        <div className="flex items-center gap-6">
          {/* Conditionally show portals based on identity */}
          {user && user.role === 'user' && (
            <Link to="/dashboard" className="hidden md:flex text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors font-medium">Dashboard</Link>
          )}
          
          {user && user.role === 'admin' && (
            <Link to="/admin" className="hidden md:flex text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors font-medium">Admin Portal</Link>
          )}
          
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors text-gray-600 dark:text-gray-300"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {user ? (
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all font-medium text-sm">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          ) : (
            <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-all shadow-sm font-medium text-sm">
              <User className="w-4 h-4" /> <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
