import { useState, useEffect } from 'react';
import { Search, Moon, Sun, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LogoMark = ({ className = "w-7 h-7" }: { className?: string }) => (
  <img 
    src="/curiosift-mark.png" 
    alt="CurioSift" 
    className={`object-contain shrink-0 drop-shadow-sm transition-transform duration-200 hover:scale-105 ${className}`}
  />
);

export default function TopNav() {
  const { displayName, signOut } = useAuth();
  const navigate = useNavigate();

  // ── Persistent dark mode ──────────────────────────────────────
  const [isDark, setIsDark] = useState<boolean>(() => {
    try { return localStorage.getItem('curio-theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('curio-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('curio-theme', 'light');
    }
  }, [isDark]);

  // ── Initials ──────────────────────────────────────────────────
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-10 transition-colors">

      {/* Left: Logo + Search */}
      <div className="flex items-center flex-1 max-w-xl gap-6">
        {/* Logo */}
        <NavLink to="/dashboard" className="hidden md:flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg shrink-0 group">
          <LogoMark className="w-7 h-7" />
          <span className="font-extrabold tracking-tight text-lg text-text">
            Curio<span className="text-primary">Sift</span>
          </span>
        </NavLink>

        {/* Search Bar */}
        <div className="relative group flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search PDFs, summaries..."
            className="w-full h-10 pl-10 pr-16 bg-gray-50/50 border border-border hover:border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all shadow-sm"
            aria-label="Search"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary bg-white border border-border rounded-md shadow-sm">Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary bg-white border border-border rounded-md shadow-sm">K</kbd>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 ml-6">

        {/* Theme toggle only — bell & settings icon removed */}
        <div className="flex items-center pr-2 border-r border-border gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg hover:bg-gray-100 text-text-secondary hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Profile & Logout */}
        <div className="flex items-center gap-2">
          <NavLink to="/settings" className="flex items-center gap-2 p-1.5 pl-2 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-text leading-tight">{displayName}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white">
              {initials || '?'}
            </div>
          </NavLink>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-50 text-text-secondary hover:text-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger ml-1"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
