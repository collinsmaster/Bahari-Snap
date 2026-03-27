import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Post as PostType } from '../types';
import PostItem from './PostItem';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves } from 'lucide-react';

interface FeedProps {
  token: string;
}

export default function Feed({ token }: FeedProps) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsData = await api.get('/posts', token);
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="p-4 bg-ocean-mid rounded-full border border-ocean-neon shadow-[0_0_15px_rgba(100,255,218,0.3)]"
        >
          <Waves className="w-12 h-12 text-ocean-neon" />
        </motion.div>
        <p className="text-ocean-foam/60 font-bold animate-pulse">Riding the waves...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center px-6">
        <Waves className="w-16 h-16 text-ocean-foam/20 mb-4" />
        <h2 className="text-2xl font-bold mb-2">The ocean is calm...</h2>
        <p className="text-ocean-foam/60">Be the first to create a wave! Upload your first snap.</p>
      </div>
    );
  }

  return (
    <div className="snap-container h-screen w-full -mt-16">
      <AnimatePresence>
        {posts.map((post) => (
          <div key={post.id} className="snap-item">
            <PostItem post={post} token={token} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
