import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

const LogoSVG = () => (
  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <rect width="32" height="32" rx="8" fill="url(#paint0_linear_logo_login)" />
    <path d="M12 21H21C21.5523 21 22 20.5523 22 20V10C22 9.44772 21.5523 9 21 9H12C10.3431 9 9 10.3431 9 12V21H12ZM12 21V19M12 21C10.8954 21 10 20.1046 10 19V12C10 10.8954 10.8954 10 12 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.5 13.5L16.5 11.5L17.5 13.5L19.5 14.5L17.5 15.5L16.5 17.5L15.5 15.5L13.5 14.5L15.5 13.5Z" fill="white" />
    <defs>
      <linearGradient id="paint0_linear_logo_login" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563EB" />
        <stop offset="1" stopColor="#9333EA" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Simple validation
  const isEmailValid = email.includes('@') && email.length > 3;
  const isPasswordValid = password.length >= 6;
  const isValid = isEmailValid && isPasswordValid;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px]"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 sm:p-10">
          
          <div className="flex flex-col items-center text-center mb-8">
            <NavLink to="/" className="inline-block mb-6 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg transition-transform hover:scale-105">
              <LogoSVG />
            </NavLink>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-sm sm:text-base text-text-secondary font-medium">
              Sign in to continue your learning journey
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text ml-1 block">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 text-text placeholder:text-gray-400"
                  required
                />
              </div>
              {email.length > 0 && !isEmailValid && (
                <p className="text-xs text-red-500 font-medium ml-1">Please enter a valid email address.</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1 mb-1.5">
                <label className="text-sm font-semibold text-text">Password</label>
                <a href="#" className="text-xs font-semibold text-primary hover:text-blue-700 transition-colors">
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 text-text placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-secondary hover:text-text transition-colors outline-none focus-visible:text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && !isPasswordValid && (
                <p className="text-xs text-red-500 font-medium ml-1">Password must be at least 6 characters.</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 ml-1">
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 transition-colors cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm font-medium text-text-secondary cursor-pointer select-none hover:text-text transition-colors">
                Remember for 30 days
              </label>
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full h-12 text-base mt-2" 
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs font-semibold">
              <span className="bg-white px-3 text-text-secondary uppercase tracking-widest">
                Or
              </span>
            </div>
          </div>

          {/* Signup Link */}
          <div className="text-center text-sm font-medium text-text-secondary">
            Don't have an account?{' '}
            <NavLink to="/signup" className="text-primary hover:text-blue-700 font-bold transition-colors">
              Sign up for free
            </NavLink>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
