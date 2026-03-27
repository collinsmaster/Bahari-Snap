import { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, db, doc, getDoc, setDoc, serverTimestamp } from './lib/firebase';
import { UserProfile } from './types';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import Profile from './components/Profile';
import Circles from './components/Circles';
import Upload from './components/Upload';
import { Toaster } from 'sonner';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'feed' | 'profile' | 'circles' | 'upload'>('feed');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Create initial profile
          const newProfile: UserProfile = {
            uid: user.uid,
            username: user.email?.split('@')[0] || `user_${Math.floor(Math.random() * 1000)}`,
            displayName: user.displayName || 'Anonymous',
            photoURL: user.photoURL || '',
            followersCount: 0,
            followingCount: 0,
            createdAt: serverTimestamp() as any,
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
        <Auth />
        <Toaster position="top-center" theme="dark" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-ocean-deep text-ocean-foam font-sans">
      <Navbar currentView={view} setView={setView} profile={profile} />
      
      <main className="max-w-4xl mx-auto pt-16 pb-20">
        {view === 'feed' && <Feed />}
        {view === 'circles' && <Circles />}
        {view === 'upload' && <Upload onComplete={() => setView('feed')} />}
        {view === 'profile' && <Profile profile={profile} />}
      </main>

      <Toaster position="top-center" theme="dark" />
    </div>
  );
}

