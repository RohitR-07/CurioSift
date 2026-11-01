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

const LogoMark = ({ className = "w-8 h-8" }: { className?: string }) => (
  <img 
    src="/curiosift-mark.png" 
    alt="CurioSift" 
    className={cn("object-contain shrink-0 drop-shadow-sm transition-transform duration-200 hover:scale-105", className)} 
  />
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
        <a href="#home" className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg group">
          <LogoMark className="w-8 h-8" />
          <span className="font-extrabold tracking-tight text-xl text-text">
            Curio<span className="text-primary">Sift</span>
          </span>
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
          <NavLink to="/login">
            <Button variant="ghost" className="font-semibold">Sign In</Button>
          </NavLink>
          <NavLink to="/signup">
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
                <NavLink to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full font-semibold">Sign In</Button>
                </NavLink>
                <NavLink to="/signup" onClick={() => setMobileMenuOpen(false)}>
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
