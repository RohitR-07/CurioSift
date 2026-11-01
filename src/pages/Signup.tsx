import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';



export default function Signup() {
  const navigate = useNavigate();
  const { signUp, isConfigured } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signedUp, setSignedUp] = useState(false);

  // Validation
  const isNameValid = name.trim().length > 1;
  const isEmailValid = email.includes('@') && email.length > 3;
  const isPasswordValid = password.length >= 6;
  const isConfirmPasswordValid = password === confirmPassword;
  
  const isValid = isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid && agreeTerms;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setAuthError(null);
    setIsLoading(true);

    if (!isConfigured) {
      // Supabase not configured — allow dev access without auth
      navigate('/dashboard');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password, name.trim());
      if (error) {
        setAuthError(error.message ?? 'Sign-up failed. Please try again.');
      } else {
        // Supabase sends a confirmation email by default.
        // Show a success message instead of navigating directly.
        setSignedUp(true);
      }
    } catch (err: any) {
      setAuthError(err?.message ?? 'Sign-up failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50 dark:from-[#0B0F19] dark:via-[#0F172A] dark:to-[#0B0F19] flex items-center justify-center p-6 relative overflow-hidden transition-colors">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-400/20 dark:purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[460px] relative z-10"
      >
        <div className="bg-white/90 dark:bg-card/95 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-white dark:border-border p-8 sm:p-10 my-8 transition-colors">
          
          <div className="flex flex-col items-center text-center mb-8">
            <NavLink
              to="/"
              className="inline-flex flex-col items-center mb-4 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl transition-transform hover:scale-105 group"
              title="CurioSift Home"
            >
              {/* Light mode full logo */}
              <img 
                src="/curiosift-logo.png" 
                alt="CurioSift" 
                className="h-28 sm:h-32 w-auto object-contain dark:hidden drop-shadow-sm transition-transform duration-200 group-hover:scale-105" 
              />
              {/* Dark mode full logo */}
              <img 
                src="/curiosift-logo-dark.png" 
                alt="CurioSift" 
                className="h-28 sm:h-32 w-auto object-contain hidden dark:block drop-shadow-[0_4px_24px_rgba(59,130,246,0.35)] transition-transform duration-200 group-hover:scale-105" 
              />
            </NavLink>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight mb-2">
              Create Your Account
            </h1>
            <p className="text-sm sm:text-base text-text-secondary font-medium">
              Start your AI-powered learning journey
            </p>
          </div>

          {/* Success screen — shown after successful sign-up */}
          {signedUp ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-text">Check your inbox!</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                We've sent a confirmation link to <strong>{email}</strong>.<br />
                Click the link to activate your account, then sign in.
              </p>
              <NavLink
                to="/login"
                className="mt-2 text-primary font-semibold hover:underline text-sm"
              >
                Go to Sign In →
              </NavLink>
            </div>
          ) : (
            <>
          {authError && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            
            {/* Full Name Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text ml-1 block">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-background/80 border border-gray-200 dark:border-border rounded-xl text-sm outline-none transition-all focus:bg-white dark:focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/10 text-text placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  required
                />
              </div>
            </div>

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
              <label className="text-sm font-semibold text-text ml-1 block">Password</label>
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
            
            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text ml-1 block">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-gray-50/50 dark:bg-background/80 border border-gray-200 dark:border-border rounded-xl text-sm outline-none transition-all focus:bg-white dark:focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/10 text-text placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-secondary hover:text-text transition-colors outline-none focus-visible:text-primary"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !isConfirmPasswordValid && (
                <p className="text-xs text-red-500 font-medium ml-1">Passwords do not match.</p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2 ml-1 pt-2">
              <input 
                type="checkbox" 
                id="terms" 
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-border dark:bg-background text-primary focus:ring-primary/20 transition-colors cursor-pointer shrink-0"
              />
              <label htmlFor="terms" className="text-sm font-medium text-text-secondary cursor-pointer select-none">
                I agree to the <a href="#" className="text-primary hover:text-blue-700 transition-colors">Terms of Service</a> and <a href="#" className="text-primary hover:text-blue-700 transition-colors">Privacy Policy</a>
              </label>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 text-base mt-4" 
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-border" />
            </div>
            <div className="relative flex justify-center text-xs font-semibold">
              <span className="bg-white dark:bg-card px-3 text-text-secondary uppercase tracking-widest">
                Or
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center text-sm font-medium text-text-secondary">
            Already have an account?{' '}
            <NavLink to="/login" className="text-primary hover:text-blue-700 font-bold transition-colors">
              Sign In
            </NavLink>
          </div>
          </>
          )}
          
        </div>
      </motion.div>
    </div>
  );
}
