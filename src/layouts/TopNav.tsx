import { useState } from 'react';
import { Search, Bell, Settings, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopNav() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-10 transition-colors">
      
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search PDFs, summaries, and notes..." 
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

        {/* Profile */}
        <button className="flex items-center gap-2 p-1.5 pl-2 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-text leading-tight">Student User</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white">
            US
          </div>
        </button>
      </div>
    </header>
  );
}
