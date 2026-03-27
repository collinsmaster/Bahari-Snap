import { useState } from 'react';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import { api } from '../lib/api';
import { motion } from 'framer-motion';
import { Waves, LogIn, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { UserProfile } from '../types';

interface AuthProps {
  onAuthSuccess: (token: string, user: UserProfile) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [tempUser, setTempUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (mode === 'register') {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
      if (username.length < 3 || username.length > 20) {
        toast.error('Username must be 3-20 characters');
        return false;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        toast.error('Username can only contain letters, numbers, and underscores');
        return false;
      }
      if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        toast.error('Password must be at least 8 characters with one letter and one number');
        return false;
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Invalid email address');
      return false;
    }
    return true;
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const res = await api.post('/auth/google', {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid
      });
      onAuthSuccess(res.token, res.user);
      toast.success('Welcome to Bahari Snap!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login' 
        ? { email, password } 
        : { email, password, username, displayName };
      
      const res = await api.post(endpoint, body);
      
      if (mode === 'register' || (mode === 'login' && !res.user.isVerified)) {
        setTempToken(res.token);
        setTempUser(res.user);
        setShowOtp(true);
        toast.info('Please verify your email with the OTP sent.');
      } else {
        onAuthSuccess(res.token, res.user);
        toast.success('Welcome back!');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // We need to pass the token for the verify-otp endpoint
      const res = await fetch(`${api.baseUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      
      onAuthSuccess(tempToken, data.user);
      toast.success('Email verified! Welcome to the flow.');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api.baseUrl}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tempToken}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP');
      toast.success('New OTP sent to your email.');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showOtp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-ocean-deep p-4 overflow-hidden relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-10 text-center max-w-md w-full glass-morphism p-8 rounded-3xl shadow-2xl border border-ocean-neon/20"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-ocean-mid rounded-full border border-ocean-neon">
              <Mail className="w-12 h-12 text-ocean-neon" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-ocean-foam mb-2">Verify Email</h2>
          <p className="text-ocean-foam/60 mb-8 text-sm">
            We've sent a 6-digit code to <span className="text-ocean-neon">{tempUser?.email}</span>
          </p>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-ocean-mid/50 border border-ocean-foam/10 rounded-xl py-4 text-center text-3xl font-bold tracking-[1em] text-ocean-neon focus:outline-none focus:border-ocean-neon transition-colors"
              required
            />

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex items-center justify-center gap-3 bg-ocean-neon text-ocean-deep font-bold py-3 px-6 rounded-xl hover:bg-ocean-wave transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <button
            onClick={handleResendOtp}
            disabled={loading}
            className="mt-6 text-sm text-ocean-neon hover:underline disabled:opacity-50"
          >
            Didn't receive code? Resend
          </button>
          
          <button
            onClick={() => setShowOtp(false)}
            className="block w-full mt-4 text-xs text-ocean-foam/40 hover:text-ocean-foam transition-colors"
          >
            Back to Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-ocean-deep p-4 overflow-hidden relative">
      {/* Animated Background Waves */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-0 right-0 h-64 bg-ocean-wave blur-3xl rounded-full"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -2, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 left-0 right-0 h-64 bg-ocean-neon blur-3xl rounded-full"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center max-w-md w-full glass-morphism p-8 rounded-3xl shadow-2xl border border-ocean-neon/20"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-ocean-mid rounded-full border border-ocean-neon shadow-[0_0_15px_rgba(100,255,218,0.3)]">
            <Waves className="w-12 h-12 text-ocean-neon" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-2 tracking-tighter text-ocean-foam">
          Bahari <span className="text-ocean-neon">Snap</span>
        </h1>
        <p className="text-ocean-foam/60 mb-8 text-sm">
          {mode === 'login' ? 'Welcome back to the flow.' : 'Join the community and start your wave.'}
        </p>

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          {mode === 'register' && (
            <>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-foam/40" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-ocean-mid/50 border border-ocean-foam/10 rounded-xl py-3 pl-12 pr-4 text-ocean-foam focus:outline-none focus:border-ocean-neon transition-colors"
                  required
                />
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-foam/40" />
                <input
                  type="text"
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-ocean-mid/50 border border-ocean-foam/10 rounded-xl py-3 pl-12 pr-4 text-ocean-foam focus:outline-none focus:border-ocean-neon transition-colors"
                  required
                />
              </div>
            </>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-foam/40" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-ocean-mid/50 border border-ocean-foam/10 rounded-xl py-3 pl-12 pr-4 text-ocean-foam focus:outline-none focus:border-ocean-neon transition-colors"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-foam/40" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-ocean-mid/50 border border-ocean-foam/10 rounded-xl py-3 pl-12 pr-4 text-ocean-foam focus:outline-none focus:border-ocean-neon transition-colors"
              required
            />
          </div>
          {mode === 'register' && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-foam/40" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-ocean-mid/50 border border-ocean-foam/10 rounded-xl py-3 pl-12 pr-4 text-ocean-foam focus:outline-none focus:border-ocean-neon transition-colors"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-ocean-neon text-ocean-deep font-bold py-3 px-6 rounded-xl hover:bg-ocean-wave transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-ocean-foam/10"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-ocean-deep px-2 text-ocean-foam/40">Or continue with</span></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50"
        >
          <LogIn className="w-5 h-5" />
          Google Account
        </button>

        <button
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setShowOtp(false);
          }}
          className="mt-6 text-sm text-ocean-neon hover:underline"
        >
          {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </motion.div>
    </div>
  );
}
