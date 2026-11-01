import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
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
  { name: 'AI Chat', href: '/chat', icon: MessageSquare, badge: 'NEW', badgeColor: 'bg-blue-500 text-white' },
  { name: 'Flashcards', href: '/flashcards', icon: BrainCircuit },
  { name: 'Quiz Generator', href: '/quiz', icon: GraduationCap, badge: 'BETA', badgeColor: 'bg-purple-100 text-purple-700' },
  { name: 'Revision Notes', href: '/notes', icon: BookOpen },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const LogoMark = ({ className = "w-9 h-9" }: { className?: string }) => (
  <img 
    src="/curiosift-mark.png" 
    alt="CurioSift" 
    className={cn("object-contain shrink-0 drop-shadow-sm transition-transform duration-200 hover:scale-105", className)} 
  />
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
              <LogoMark className="w-9 h-9" />
              <div className="flex flex-col leading-tight">
                <span className="font-extrabold tracking-tight text-xl text-text">
                  Curio<span className="text-primary">Sift</span>
                </span>
                <span className="text-[10px] text-text-secondary font-medium tracking-wide">
                  AI STUDY SUITE
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* If collapsed, show logo centered instead of empty space */}
        {collapsed && (
          <div className="mx-auto mt-2">
            <LogoMark className="w-9 h-9" />
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

    </motion.aside>
  );
}
