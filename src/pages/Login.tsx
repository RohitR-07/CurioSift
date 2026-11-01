import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Simple validation
  const isEmailValid = email.includes('@') && email.length > 3;
  const isPasswordValid = password.length >= 6;
  const isValid = isEmailValid && isPasswordValid;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setAuthError(null);
    setIsLoading(true);

    if (!isConfigured) {
      // Supabase not configured — allow dev access without auth
      navigate((location.state as any)?.from?.pathname ?? '/dashboard', { replace: true });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setAuthError(error.message ?? 'Sign-in failed. Please check your credentials.');
      } else {
        const destination = (location.state as any)?.from?.pathname ?? '/dashboard';
        navigate(destination, { replace: true });
      }
    } catch (err: any) {
      setAuthError(err?.message ?? 'Sign-in failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50 dark:from-[#0B0F19] dark:via-[#0F172A] dark:to-[#0B0F19] flex items-center justify-center p-6 relative overflow-hidden transition-colors">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px]"
      >
        <div className="bg-white/90 dark:bg-card/95 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-white dark:border-border p-8 sm:p-10 transition-colors">
          
          <div className="flex flex-col items-center text-center mb-6">
            <NavLink to="/" className="inline-flex flex-col items-center mb-4 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl transition-transform hover:scale-105 group" title="CurioSift Home">
              <img 
                src="/curiosift-logo.png" 
                alt="CurioSift" 
                className="h-28 sm:h-32 w-auto object-contain dark:hidden drop-shadow-sm transition-transform duration-200 group-hover:scale-105" 
              />
              <img 
                src="/curiosift-logo-dark.png" 
                alt="CurioSift" 
                className="h-28 sm:h-32 w-auto object-contain hidden dark:block drop-shadow-[0_4px_24px_rgba(59,130,246,0.35)] transition-transform duration-200 group-hover:scale-105" 
              />
            </NavLink>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight mb-1.5">
              Welcome Back
            </h1>
            <p className="text-sm sm:text-base text-text-secondary font-medium">
              Sign in to continue your learning journey
            </p>
          </div>

          {authError && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

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
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-background/80 border border-gray-200 dark:border-border rounded-xl text-sm outline-none transition-all focus:bg-white dark:focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/10 text-text placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
                  className="w-full pl-11 pr-12 py-3 bg-gray-50/50 dark:bg-background/80 border border-gray-200 dark:border-border rounded-xl text-sm outline-none transition-all focus:bg-white dark:focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/10 text-text placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
              <div className="w-full border-t border-gray-200 dark:border-border" />
            </div>
            <div className="relative flex justify-center text-xs font-semibold">
              <span className="bg-white dark:bg-card px-3 text-text-secondary uppercase tracking-widest">
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
