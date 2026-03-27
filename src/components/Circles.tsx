import { useState, useEffect } from 'react';
import { db, collection, query, orderBy, onSnapshot } from '../lib/firebase';
import { Circle } from '../types';
import { motion } from 'framer-motion';
import { Users, Waves, ArrowRight, Search, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Circles() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'circles'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCircles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Circle[]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const defaultCircles = [
    { id: 'music', name: 'Music Waves', description: 'The rhythm of the ocean.', membersCount: 1240, color: 'from-purple-500 to-blue-500' },
    { id: 'tech', name: 'Tech Tide', description: 'Future flows here.', membersCount: 850, color: 'from-blue-500 to-cyan-500' },
    { id: 'nairobi', name: 'Nairobi Trends', description: 'City lights and ocean vibes.', membersCount: 3200, color: 'from-orange-500 to-red-500' },
    { id: 'campus', name: 'Campus Life', description: 'Student waves and ripples.', membersCount: 2100, color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-ocean-mid rounded-2xl border border-ocean-neon shadow-[0_0_10px_rgba(100,255,218,0.2)]">
            <Users className="w-6 h-6 text-ocean-neon" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">Community <span className="text-ocean-neon">Circles</span></h2>
        </div>
        <button className="p-3 bg-ocean-mid border border-ocean-neon/20 rounded-2xl text-ocean-neon hover:bg-ocean-neon hover:text-ocean-deep transition-all">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-foam/40" />
        <input 
          type="text" 
          placeholder="Find your flow..." 
          className="w-full bg-ocean-mid/50 border border-ocean-foam/10 rounded-2xl py-4 pl-12 pr-4 text-ocean-foam focus:outline-none focus:border-ocean-neon transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {defaultCircles.map((circle, index) => (
          <motion.div
            key={circle.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative h-48 rounded-3xl overflow-hidden cursor-pointer shadow-xl"
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80 group-hover:opacity-100 transition-opacity", circle.color)} />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                  <Waves className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-2 py-1 rounded-md">
                  {circle.membersCount} Members
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black tracking-tighter uppercase mb-1">{circle.name}</h3>
                <p className="text-sm opacity-80 line-clamp-1">{circle.description}</p>
              </div>

              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all">
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="pt-10 border-t border-ocean-foam/10">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-ocean-neon mb-6">Trending Ripples</h3>
        <div className="space-y-4">
          {circles.map((circle) => (
            <div key={circle.id} className="glass-morphism p-4 rounded-2xl flex items-center justify-between hover:border-ocean-neon/40 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-ocean-mid flex items-center justify-center border border-ocean-neon/20">
                  <Users className="w-6 h-6 text-ocean-neon" />
                </div>
                <div>
                  <h4 className="font-bold text-ocean-foam">#{circle.name.replace(/\s+/g, '').toLowerCase()}</h4>
                  <p className="text-xs text-ocean-foam/40">{circle.membersCount} members riding this wave</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-ocean-light text-ocean-neon text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-ocean-neon hover:text-ocean-deep transition-all">
                Join
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
