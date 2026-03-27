import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import { motion } from 'framer-motion';
import { Waves, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Welcome to Bahari Snap!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-ocean-deep p-4 overflow-hidden relative">
      {/* Animated Background Waves */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 2, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-0 right-0 h-64 bg-ocean-wave blur-3xl rounded-full"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -2, 0],
          }}
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
        
        <h1 className="text-5xl font-bold mb-2 tracking-tighter text-ocean-foam">
          Bahari <span className="text-ocean-neon">Snap</span>
        </h1>
        <p className="text-ocean-foam/60 mb-8 text-lg">
          Dive into the flow of endless content and community.
        </p>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-ocean-neon text-ocean-deep font-bold py-4 px-6 rounded-xl hover:bg-ocean-wave transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          <LogIn className="w-5 h-5" />
          Dive In with Google
        </button>

        <div className="mt-8 pt-8 border-t border-ocean-foam/10 text-xs text-ocean-foam/40">
          By joining, you agree to ride the waves responsibly.
        </div>
      </motion.div>
    </div>
  );
}
