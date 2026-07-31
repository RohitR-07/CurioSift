import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'FAQ', href: '#faq' },
];

const LogoSVG = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <rect width="32" height="32" rx="8" fill="url(#paint0_linear_logo)" />
    <path d="M12 21H21C21.5523 21 22 20.5523 22 20V10C22 9.44772 21.5523 9 21 9H12C10.3431 9 9 10.3431 9 12V21H12ZM12 21V19M12 21C10.8954 21 10 20.1046 10 19V12C10 10.8954 10.8954 10 12 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.5 13.5L16.5 11.5L17.5 13.5L19.5 14.5L17.5 15.5L16.5 17.5L15.5 15.5L13.5 14.5L15.5 13.5Z" fill="white" />
    <defs>
      <linearGradient id="paint0_linear_logo" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563EB" />
        <stop offset="1" stopColor="#9333EA" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-white/80 backdrop-blur-md border-border/50 py-3 shadow-sm" 
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
          <LogoSVG />
          <span className="font-bold tracking-tight text-xl text-text">StudyMate AI</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-2 py-1"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <NavLink to="/dashboard">
            <Button variant="ghost" className="font-semibold">Sign In</Button>
          </NavLink>
          <NavLink to="/dashboard">
            <Button className="font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30">
              Get Started
            </Button>
          </NavLink>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-text-secondary hover:text-text transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-border overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-text-secondary hover:text-primary transition-colors p-2 -mx-2 rounded-lg hover:bg-gray-50"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full font-semibold">Sign In</Button>
                </NavLink>
                <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full font-semibold">Get Started</Button>
                </NavLink>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
