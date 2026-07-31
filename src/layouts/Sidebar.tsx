import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Files, 
  FileText, 
  Lightbulb, 
  HelpCircle, 
  MessageSquare, 
  BrainCircuit, 
  GraduationCap, 
  BookOpen, 
  BarChart3, 
  Settings,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My PDFs', href: '/pdfs', icon: Files },
  { name: 'AI Summary', href: '/summary', icon: FileText },
  { name: 'AI Explain', href: '/explain', icon: Lightbulb },
  { name: 'Question Generator', href: '/questions', icon: HelpCircle },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare, badge: 'NEW', badgeColor: 'bg-blue-500 text-white' },
  { name: 'Flashcards', href: '/flashcards', icon: BrainCircuit },
  { name: 'Quiz Generator', href: '/quiz', icon: GraduationCap, badge: 'BETA', badgeColor: 'bg-purple-100 text-purple-700' },
  { name: 'Revision Notes', href: '/notes', icon: BookOpen },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const LogoSVG = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <rect width="32" height="32" rx="8" fill="url(#paint0_linear)" />
    <path d="M12 21H21C21.5523 21 22 20.5523 22 20V10C22 9.44772 21.5523 9 21 9H12C10.3431 9 9 10.3431 9 12V21H12ZM12 21V19M12 21C10.8954 21 10 20.1046 10 19V12C10 10.8954 10.8954 10 12 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.5 13.5L16.5 11.5L17.5 13.5L19.5 14.5L17.5 15.5L16.5 17.5L15.5 15.5L13.5 14.5L15.5 13.5Z" fill="white" />
    <defs>
      <linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563EB" />
        <stop offset="1" stopColor="#9333EA" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-full bg-white border-r border-border flex flex-col relative z-20 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
      aria-label="Sidebar Navigation"
    >
      <div className="flex items-center justify-between p-6">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, transition: { duration: 0.1 } }}
              className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
            >
              <LogoSVG />
              <span className="font-bold tracking-tight text-xl text-text">StudyMate AI</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* If collapsed, show logo centered instead of empty space */}
        {collapsed && (
          <div className="mx-auto mt-2">
            <LogoSVG />
          </div>
        )}
      </div>

      {/* Collapse Button - Floating outside */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute top-8 -right-4 w-8 h-8 bg-white border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary shadow-sm transition-colors z-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
      </button>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1.5 scrollbar-hide">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive 
                  ? "bg-primary/5 text-primary font-semibold" 
                  : "text-text-secondary hover:bg-gray-50 hover:text-text font-medium",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  {/* Active Indicator Line */}
                  {isActive && !collapsed && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" 
                    />
                  )}
                  
                  <Icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", collapsed && "w-6 h-6", isActive && "text-primary")} />
                  
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="truncate whitespace-nowrap flex-1 flex items-center justify-between"
                      >
                        {item.name}
                        {item.badge && (
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider", item.badgeColor)}>
                            {item.badge}
                          </span>
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Main Settings Link */}
      <div className="px-4 pb-2">
         <NavLink
            to="/settings"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive 
                ? "bg-primary/5 text-primary font-semibold" 
                : "text-text-secondary hover:bg-gray-50 hover:text-text font-medium",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className="w-5 h-5 shrink-0 transition-transform group-hover:rotate-45" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="truncate whitespace-nowrap"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
        </NavLink>
      </div>

      {/* User Mini Profile */}
      <div className="p-4 border-t border-border mt-2">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl transition-all duration-200 cursor-pointer hover:bg-gray-50 group",
          collapsed && "justify-center"
        )}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 border border-border flex items-center justify-center shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <span className="text-primary font-bold text-sm">US</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-semibold text-text truncate">Student User</p>
                <p className="text-xs text-text-secondary truncate font-medium">Free Plan</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
