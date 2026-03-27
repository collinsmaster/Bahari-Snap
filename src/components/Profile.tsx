import { useState, useEffect } from 'react';
import { db, collection, query, where, orderBy, getDocs, auth, signOut } from '../lib/firebase';
import { UserProfile, Post as PostType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Grid, Heart, LogOut, Waves, Settings, MapPin, Calendar } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { toast } from 'sonner';

interface ProfileProps {
  profile: UserProfile | null;
}

export default function Profile({ profile }: ProfileProps) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'snaps' | 'likes'>('snaps');

  useEffect(() => {
    if (!profile) return;

    const fetchPosts = async () => {
      const q = query(
        collection(db, 'posts'),
        where('authorId', '==', profile.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PostType[]);
      setLoading(false);
    };

    fetchPosts();
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-morphism p-8 rounded-3xl border border-ocean-neon/20 shadow-2xl relative overflow-hidden"
      >
        {/* Background Wave Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-ocean-neon/10 blur-3xl -z-10 rounded-full" />
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-ocean-neon overflow-hidden bg-ocean-mid shadow-[0_0_20px_rgba(100,255,218,0.2)]">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-ocean-neon" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 bg-ocean-neon text-ocean-deep rounded-full shadow-lg">
              <Waves className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase">{profile.displayName}</h2>
              <p className="text-ocean-neon font-bold tracking-widest text-sm uppercase">@{profile.username}</p>
            </div>

            <p className="text-ocean-foam/70 leading-relaxed text-sm max-w-md">
              {profile.bio || "Riding the digital waves of Bahari Snap. Catch the flow!"}
            </p>

            <div className="flex items-center justify-center md:justify-start gap-6 pt-2">
              <div className="text-center">
                <p className="text-xl font-black text-ocean-neon">{profile.followersCount}</p>
                <p className="text-[10px] uppercase tracking-widest text-ocean-foam/40 font-bold">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-ocean-neon">{profile.followingCount}</p>
                <p className="text-[10px] uppercase tracking-widest text-ocean-foam/40 font-bold">Following</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-ocean-neon">{posts.length}</p>
                <p className="text-[10px] uppercase tracking-widest text-ocean-foam/40 font-bold">Waves</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-ocean-foam/10 flex items-center justify-between text-xs text-ocean-foam/40 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            Joined {formatDate(profile.createdAt)}
          </div>
          <button className="flex items-center gap-2 text-ocean-neon hover:text-ocean-wave transition-colors">
            <Settings className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-8 border-b border-ocean-foam/10">
        <button
          onClick={() => setActiveTab('snaps')}
          className={cn(
            "pb-4 px-4 text-sm font-bold uppercase tracking-widest transition-all relative",
            activeTab === 'snaps' ? "text-ocean-neon" : "text-ocean-foam/40 hover:text-ocean-foam/70"
          )}
        >
          <Grid className="w-4 h-4 inline mr-2" />
          My Snaps
          {activeTab === 'snaps' && (
            <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-ocean-neon rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('likes')}
          className={cn(
            "pb-4 px-4 text-sm font-bold uppercase tracking-widest transition-all relative",
            activeTab === 'likes' ? "text-ocean-neon" : "text-ocean-foam/40 hover:text-ocean-foam/70"
          )}
        >
          <Heart className="w-4 h-4 inline mr-2" />
          Liked Waves
          {activeTab === 'likes' && (
            <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-ocean-neon rounded-t-full" />
          )}
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-ocean-mid animate-pulse rounded-xl" />
          ))
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-xl overflow-hidden relative group cursor-pointer border border-ocean-foam/5"
            >
              {post.mediaType === 'video' ? (
                <video src={post.mediaUrl} className="w-full h-full object-cover" />
              ) : (
                <img src={post.mediaUrl} alt={post.caption} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-ocean-deep/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-ocean-neon text-ocean-neon" />
                  <span className="text-xs font-bold">{post.likesCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Waves className="w-4 h-4 text-ocean-wave" />
                  <span className="text-xs font-bold">{post.commentsCount}</span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-3 py-20 text-center opacity-40">
            <Waves className="w-12 h-12 mx-auto mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">No waves yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
