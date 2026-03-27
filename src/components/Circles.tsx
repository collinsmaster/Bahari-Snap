import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Circle } from '../types';
import { motion } from 'framer-motion';
import { Users, Waves, ArrowRight, Search, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface CirclesProps {
  token: string;
}

export default function Circles({ token }: CirclesProps) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const data = await api.get('/circles', token);
        setCircles(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCircles();
  }, [token]);

  const defaultCircles = [
    { id: 'music', name: 'Music Waves', description: 'The rhythm of the ocean.', membersCount: 1240, color: 'from-purple-500 to-blue-500' },
    { id: 'tech', name: 'Tech Tide', description: 'Future flows here.', membersCount: 850, color: 'from-blue-500 to-cyan-500' },
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {defaultCircles.map((circle, index) => (
          <motion.div key={circle.id} initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} className="group relative h-48 rounded-3xl overflow-hidden cursor-pointer shadow-xl">
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80 group-hover:opacity-100 transition-opacity", circle.color)} />
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start"><div className="p-2 bg-white/20 backdrop-blur-md rounded-xl"><Waves className="w-6 h-6" /></div></div>
              <div><h3 className="text-2xl font-black tracking-tighter uppercase mb-1">{circle.name}</h3><p className="text-sm opacity-80 line-clamp-1">{circle.description}</p></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
