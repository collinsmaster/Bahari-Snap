import { useState, useEffect, useRef } from 'react';
import { Post as PostType, Comment as CommentType, Reaction as ReactionType } from '../types';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Flame, Laugh, Lightbulb, Send, User, Waves } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { toast } from 'sonner';

interface PostItemProps {
  post: PostType;
  token: string;
}

export default function PostItem({ post, token }: PostItemProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [reactions, setReactions] = useState<ReactionType[]>(post.reactions || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Fetch comments when drawer opens
    if (showComments) {
      const fetchComments = async () => {
        try {
          const data = await api.get(`/posts/${post.id}/comments`, token);
          setComments(data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchComments();
    }
  }, [showComments, post.id, token]);

  // Check if user liked the post
  useEffect(() => {
    // We'd need the current user ID to check this properly
    // For now, let's assume reactions are passed in
  }, [reactions]);

  // Intersection Observer for auto-play video
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.7 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const handleReact = async (type: string) => {
    try {
      const res = await api.post(`/posts/${post.id}/react`, { type }, token);
      toast.success(res.status === 'added' ? 'Reaction added!' : 'Reaction removed.');
      // Update local state (ideally we'd re-fetch or use a more reactive approach)
    } catch (error) {
      console.error(error);
      toast.error('Failed to react.');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const newComment = await api.post(`/posts/${post.id}/comments`, { text: commentText }, token);
      setComments([...comments, newComment]);
      setCommentText('');
      toast.success('Echo added!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add comment.');
    }
  };

  return (
    <div className="relative h-full w-full bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Media Content */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        {post.mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={post.mediaUrl}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
            onClick={() => {
              if (isPlaying) {
                videoRef.current?.pause();
                setIsPlaying(false);
              } else {
                videoRef.current?.play().catch(() => {});
                setIsPlaying(true);
              }
            }}
          />
        ) : (
          <img
            src={post.mediaUrl}
            alt={post.caption}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-32 z-20 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center">
          <button 
            onClick={() => handleReact('❤️')}
            className={cn(
              "p-3 rounded-full glass-morphism transition-all transform active:scale-90",
              isLiked ? "text-red-500 border-red-500/50" : "text-white"
            )}
          >
            <Heart className={cn("w-7 h-7", isLiked && "fill-current")} />
          </button>
          <span className="text-xs font-bold mt-1 text-white drop-shadow-md">{post.likesCount}</span>
        </div>

        <div className="flex flex-col items-center">
          <button 
            onClick={() => setShowComments(!showComments)}
            className="p-3 rounded-full glass-morphism text-white transition-all transform active:scale-90"
          >
            <MessageCircle className="w-7 h-7" />
          </button>
          <span className="text-xs font-bold mt-1 text-white drop-shadow-md">{post.commentsCount}</span>
        </div>

        <div className="flex flex-col items-center">
          <button className="p-3 rounded-full glass-morphism text-white transition-all transform active:scale-90">
            <Share2 className="w-7 h-7" />
          </button>
          <span className="text-xs font-bold mt-1 text-white drop-shadow-md">Share</span>
        </div>

        {/* Wave Interactions */}
        <div className="flex flex-col gap-3 mt-4">
          <button onClick={() => handleReact('🔥')} className="p-2 rounded-full glass-morphism text-orange-500 hover:scale-110 transition-transform">
            <Flame className="w-5 h-5" />
          </button>
          <button onClick={() => handleReact('😂')} className="p-2 rounded-full glass-morphism text-yellow-500 hover:scale-110 transition-transform">
            <Laugh className="w-5 h-5" />
          </button>
          <button onClick={() => handleReact('💡')} className="p-2 rounded-full glass-morphism text-blue-400 hover:scale-110 transition-transform">
            <Lightbulb className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute left-4 bottom-24 right-20 z-20 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full border-2 border-ocean-neon overflow-hidden bg-ocean-mid">
            {post.author.photoURL ? (
              <img src={post.author.photoURL} alt={post.author.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-6 h-6 text-ocean-neon" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg tracking-tight">@{post.author.username}</h3>
            <p className="text-xs text-ocean-neon font-medium">Original Wave</p>
          </div>
        </div>
        
        <p className="text-sm line-clamp-2 leading-relaxed opacity-90">
          {post.caption}
        </p>
      </div>

      {/* Comments Drawer */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-x-0 bottom-0 z-30 h-[60vh] glass-morphism rounded-t-3xl border-t border-ocean-neon/20 flex flex-col"
          >
            <div className="p-4 border-b border-ocean-foam/10 flex items-center justify-between">
              <h3 className="font-bold text-ocean-neon uppercase tracking-widest text-sm">Echoes ({comments.length})</h3>
              <button onClick={() => setShowComments(false)} className="text-ocean-foam/40 hover:text-ocean-foam">Close</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-ocean-mid flex-shrink-0 overflow-hidden">
                    {comment.author.photoURL ? (
                      <img src={comment.author.photoURL} alt={comment.author.username} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-full h-full p-1 text-ocean-neon" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-ocean-foam">@{comment.author.username}</span>
                      <span className="text-[10px] text-ocean-foam/40">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-ocean-foam/80 mt-1">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="p-4 border-t border-ocean-foam/10 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add an echo..."
                className="flex-1 bg-ocean-mid/50 border border-ocean-foam/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-ocean-neon transition-colors"
              />
              <button type="submit" className="p-2 bg-ocean-neon text-ocean-deep rounded-xl hover:bg-ocean-wave transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
