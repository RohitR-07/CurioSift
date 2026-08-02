import { useState } from 'react';
import { Search, Bell, Settings, Moon, Sun, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

const LogoSVG = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <rect width="32" height="32" rx="8" fill="url(#paint0_linear_logo_nav)" />
    <path d="M12 21H21C21.5523 21 22 20.5523 22 20V10C22 9.44772 21.5523 9 21 9H12C10.3431 9 9 10.3431 9 12V21H12ZM12 21V19M12 21C10.8954 21 10 20.1046 10 19V12C10 10.8954 10.8954 10 12 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.5 13.5L16.5 11.5L17.5 13.5L19.5 14.5L17.5 15.5L16.5 17.5L15.5 15.5L13.5 14.5L15.5 13.5Z" fill="white" />
    <defs>
      <linearGradient id="paint0_linear_logo_nav" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563EB" />
        <stop offset="1" stopColor="#9333EA" />
      </linearGradient>
    </defs>
  </svg>
);

export default function TopNav() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-10 transition-colors">
      
      {/* Left: Logo + Search */}
      <div className="flex items-center flex-1 max-w-xl gap-6">
        {/* Logo */}
        <NavLink to="/dashboard" className="hidden md:flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg shrink-0">
          <LogoSVG />
          <span className="font-bold tracking-tight text-lg text-text">StudyMate AI</span>
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
        
        {/* Quick Settings & Theme */}
        <div className="flex items-center pr-2 border-r border-border gap-1">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg hover:bg-gray-100 text-text-secondary hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Toggle Theme"
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-gray-100 text-text-secondary hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-gray-100 text-text-secondary hover:text-text transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-white border-none"></span>
          </motion.button>
        </div>

        {/* Profile & Logout */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 p-1.5 pl-2 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-text leading-tight">Deepak</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white">
              DK
            </div>
          </button>
          
          <NavLink to="/login">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-red-50 text-text-secondary hover:text-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger ml-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </NavLink>
        </div>
      </div>
    </header>
  );
}
