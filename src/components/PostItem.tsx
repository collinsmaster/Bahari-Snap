import { useState, useEffect, useRef } from 'react';
import { Post as PostType, Comment as CommentType, Reaction as ReactionType } from '../types';
import { db, auth, collection, doc, addDoc, updateDoc, deleteDoc, query, where, onSnapshot, serverTimestamp, increment } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Flame, Laugh, Lightbulb, Send, User, MoreVertical, Waves } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { toast } from 'sonner';

interface PostItemProps {
  post: PostType;
}

export default function PostItem({ post }: PostItemProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [reactions, setReactions] = useState<ReactionType[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Fetch comments
    const commentsQuery = query(
      collection(db, `posts/${post.id}/comments`),
      where('postId', '==', post.id)
    );
    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CommentType[]);
    });

    // Fetch reactions
    const reactionsQuery = query(
      collection(db, `posts/${post.id}/reactions`),
      where('postId', '==', post.id)
    );
    const unsubscribeReactions = onSnapshot(reactionsQuery, (snapshot) => {
      const reactionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ReactionType[];
      setReactions(reactionsData);
      setIsLiked(reactionsData.some(r => r.userId === auth.currentUser?.uid && r.type === '❤️'));
    });

    // Intersection Observer for auto-play video
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play();
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

    return () => {
      unsubscribeComments();
      unsubscribeReactions();
      observer.disconnect();
    };
  }, [post.id]);

  const handleLike = async () => {
    if (!auth.currentUser) return;
    
    const userReaction = reactions.find(r => r.userId === auth.currentUser?.uid && r.type === '❤️');
    
    try {
      if (userReaction) {
        await deleteDoc(doc(db, `posts/${post.id}/reactions`, userReaction.id));
        await updateDoc(doc(db, 'posts', post.id), { likesCount: increment(-1) });
      } else {
        await addDoc(collection(db, `posts/${post.id}/reactions`), {
          postId: post.id,
          userId: auth.currentUser.uid,
          type: '❤️',
          createdAt: serverTimestamp()
        });
        await updateDoc(doc(db, 'posts', post.id), { likesCount: increment(1) });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to react.');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !auth.currentUser) return;

    try {
      await addDoc(collection(db, `posts/${post.id}/comments`), {
        postId: post.id,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Anonymous',
        authorPhoto: auth.currentUser.photoURL || '',
        text: commentText,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'posts', post.id), { commentsCount: increment(1) });
      setCommentText('');
      toast.success('Comment added to the wave!');
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
                videoRef.current?.play();
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
            onClick={handleLike}
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
          <button className="p-2 rounded-full glass-morphism text-orange-500 hover:scale-110 transition-transform">
            <Flame className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full glass-morphism text-yellow-500 hover:scale-110 transition-transform">
            <Laugh className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full glass-morphism text-blue-400 hover:scale-110 transition-transform">
            <Lightbulb className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute left-4 bottom-24 right-20 z-20 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full border-2 border-ocean-neon overflow-hidden bg-ocean-mid">
            {post.authorPhoto ? (
              <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-6 h-6 text-ocean-neon" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg tracking-tight">@{post.authorName}</h3>
            <p className="text-xs text-ocean-neon font-medium">Original Wave</p>
          </div>
        </div>
        
        <p className="text-sm line-clamp-2 leading-relaxed opacity-90">
          {post.caption}
        </p>
        
        {post.circleId && (
          <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-ocean-neon/20 border border-ocean-neon/30 text-[10px] font-bold uppercase tracking-wider text-ocean-neon">
            <Waves className="w-3 h-3" />
            Circle: {post.circleId}
          </div>
        )}
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
              <button 
                onClick={() => setShowComments(false)}
                className="text-ocean-foam/40 hover:text-ocean-foam"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-ocean-mid flex-shrink-0 overflow-hidden">
                    {comment.authorPhoto ? (
                      <img src={comment.authorPhoto} alt={comment.authorName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-full h-full p-1 text-ocean-neon" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-ocean-foam">@{comment.authorName}</span>
                      <span className="text-[10px] text-ocean-foam/40">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-ocean-foam/80 mt-1">{comment.text}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-10 opacity-40">
                  <p>No echoes yet. Start the wave!</p>
                </div>
              )}
            </div>

            <form onSubmit={handleAddComment} className="p-4 border-t border-ocean-foam/10 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add an echo..."
                className="flex-1 bg-ocean-mid/50 border border-ocean-foam/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-ocean-neon transition-colors"
              />
              <button 
                type="submit"
                className="p-2 bg-ocean-neon text-ocean-deep rounded-xl hover:bg-ocean-wave transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
