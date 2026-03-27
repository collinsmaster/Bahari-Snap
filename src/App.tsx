import { useState, useEffect } from 'react';
import { api } from './lib/api';
import { UserProfile } from './types';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import Profile from './components/Profile';
import Circles from './components/Circles';
import Upload from './components/Upload';
import { Toaster } from 'sonner';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'feed' | 'profile' | 'circles' | 'upload'>('feed');

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const userData = await api.get('/users/me', token);
          setUser(userData);
        } catch (error) {
          console.error("Session expired or invalid token", error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const handleAuthSuccess = (newToken: string, userData: UserProfile) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-ocean-deep">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ocean-neon"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Auth onAuthSuccess={handleAuthSuccess} />
        <Toaster position="top-center" theme="dark" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-ocean-deep text-ocean-foam font-sans">
      <Navbar currentView={view} setView={setView} profile={user} onLogout={handleLogout} />
      
      <main className="max-w-4xl mx-auto pt-16 pb-20">
        {view === 'feed' && <Feed token={token!} />}
        {view === 'circles' && <Circles token={token!} />}
        {view === 'upload' && <Upload token={token!} onComplete={() => setView('feed')} />}
        {view === 'profile' && <Profile profile={user} token={token!} />}
      </main>

      <Toaster position="top-center" theme="dark" />
    </div>
  );
}


