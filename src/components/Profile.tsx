import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { UserProfile, Post as PostType } from '../types';
import { motion } from 'framer-motion';
import { User, Grid, Heart, Waves, Settings, Calendar } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

interface ProfileProps {
  profile: UserProfile | null;
  token: string;
}

export default function Profile({ profile, token }: ProfileProps) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'snaps' | 'likes'>('snaps');

  useEffect(() => {
    if (!profile) return;
    const fetchPosts = async () => {
      try {
        const data = await api.get(`/posts`, token); // In a real app, we'd filter by user on backend
        setPosts(data.filter((p: any) => p.authorId === profile.id));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [profile, token]);

  if (!profile) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-morphism p-8 rounded-3xl border border-ocean-neon/20 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full border-4 border-ocean-neon overflow-hidden bg-ocean-mid shadow-[0_0_20px_rgba(100,255,218,0.2)]">
            {profile.photoURL ? <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="w-16 h-16 text-ocean-neon" /></div>}
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase">{profile.displayName}</h2>
              <p className="text-ocean-neon font-bold tracking-widest text-sm uppercase">@{profile.username}</p>
            </div>
            <p className="text-ocean-foam/70 leading-relaxed text-sm max-w-md">{profile.bio || "Riding the digital waves of Bahari Snap."}</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-ocean-foam/10 flex items-center justify-between text-xs text-ocean-foam/40 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2"><Calendar className="w-3 h-3" />Joined {formatDate(profile.createdAt)}</div>
          <button className="flex items-center gap-2 text-ocean-neon hover:text-ocean-wave transition-colors"><Settings className="w-4 h-4" />Edit Profile</button>
        </div>
      </motion.div>

      <div className="flex items-center justify-center gap-8 border-b border-ocean-foam/10">
        <button onClick={() => setActiveTab('snaps')} className={cn("pb-4 px-4 text-sm font-bold uppercase tracking-widest transition-all relative", activeTab === 'snaps' ? "text-ocean-neon" : "text-ocean-foam/40 hover:text-ocean-foam/70")}>
          <Grid className="w-4 h-4 inline mr-2" />My Snaps
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {loading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square bg-ocean-mid animate-pulse rounded-xl" />) : posts.map((post) => (
          <div key={post.id} className="aspect-square rounded-xl overflow-hidden relative group cursor-pointer border border-ocean-foam/5">
            {post.mediaType === 'video' ? <video src={post.mediaUrl} className="w-full h-full object-cover" /> : <img src={post.mediaUrl} alt={post.caption} className="w-full h-full object-cover" />}
          </div>
        ))}
      </div>
    </div>
  );
}
