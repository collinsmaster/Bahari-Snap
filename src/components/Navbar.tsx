import { motion } from 'framer-motion';
import { Home, Users, PlusSquare, User, LogOut, Waves } from 'lucide-react';
import { auth, signOut } from '../lib/firebase';
import { UserProfile } from '../types';
import { toast } from 'sonner';

interface NavbarProps {
  currentView: 'feed' | 'profile' | 'circles' | 'upload';
  setView: (view: 'feed' | 'profile' | 'circles' | 'upload') => void;
  profile: UserProfile | null;
  onLogout: () => void;
}

export default function Navbar({ currentView, setView, profile, onLogout }: NavbarProps) {
  const handleLogout = () => {
    onLogout();
    toast.success('Signed out successfully.');
  };

  const navItems = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'circles', icon: Users, label: 'Circles' },
    { id: 'upload', icon: PlusSquare, label: 'Upload' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-morphism h-16 flex items-center justify-between px-6 border-b border-ocean-neon/10">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setView('feed')}
        >
          <Waves className="w-8 h-8 text-ocean-neon group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black tracking-tighter text-ocean-foam">
            BAHARI <span className="text-ocean-neon">SNAP</span>
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 text-ocean-foam/60 hover:text-ocean-neon transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Bottom Navigation (Mobile Friendly) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-morphism h-20 flex items-center justify-around px-4 border-t border-ocean-neon/10 md:max-w-md md:mx-auto md:rounded-t-3xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className="relative flex flex-col items-center justify-center w-16 h-16 group"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 bg-ocean-neon/10 rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon 
                className={`w-6 h-6 transition-all duration-300 ${
                  isActive ? 'text-ocean-neon scale-110' : 'text-ocean-foam/40 group-hover:text-ocean-foam/70'
                }`} 
              />
              <span className={`text-[10px] mt-1 font-bold uppercase tracking-widest ${
                isActive ? 'text-ocean-neon' : 'text-ocean-foam/40'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
