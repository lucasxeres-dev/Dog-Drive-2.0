import React from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Dog } from '../types';
import { MapPin, Info, Sparkles, ShieldCheck } from 'lucide-react';

interface SwipeCardProps {
  dog: Dog;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
  index: number;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ dog, onSwipe, isTop, index }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

  // SCHEMA RESILIENCY: Safe defaults for missing fields
  const safeName = dog?.name || 'Cão Sem Nome';
  const safeBreed = dog?.breed || 'SRD';
  const safeAge = dog?.age || 'N/I';
  const safeImage = dog?.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop';
  const safeLocation = dog?.location || 'Portugal';

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, zIndex: isTop ? 10 : 0 }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab active:cursor-grabbing h-full"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: x.get() < 0 ? -500 : 500, opacity: 0, transition: { duration: 0.3 } }}
    >
      <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-slate-200/40 border-4 border-white group">
        {/* Image */}
        <div className="absolute inset-0 bg-slate-50">
          <img
            src={safeImage}
            alt={safeName}
            className="h-full w-full object-cover transition-transform duration-[15s] group-hover:scale-110"
          />
        </div>

        {/* Gradient Overlay - Deeper for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Swipe Indicators */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-12 left-12 px-6 py-2 border-4 border-[#22eb7e] rounded-2xl transform -rotate-12 z-20 pointer-events-none"
        >
          <span className="text-4xl font-black text-[#22eb7e] uppercase tracking-tighter shadow-glow">SIM!</span>
        </motion.div>

        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-12 right-12 px-6 py-2 border-4 border-rose-500 rounded-2xl transform rotate-12 z-20 pointer-events-none"
        >
          <span className="text-4xl font-black text-rose-500 uppercase tracking-tighter">NOPE</span>
        </motion.div>

        {/* Feature Badge */}
        {index < 3 && (
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-8 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full flex items-center gap-2 z-10"
          >
            <Sparkles size={14} className="text-[#22eb7e]" />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Destaque</span>
          </motion.div>
        )}

        {/* Bottom Info Section */}
        <div className="absolute inset-x-0 bottom-0 p-8 text-white pointer-events-none">
          <div className="flex items-end justify-between mb-6">
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <h2 className="text-5xl font-black tracking-tighter drop-shadow-lg">{safeName}</h2>
                <span className="text-2xl font-bold opacity-80 decoration-[#22eb7e] decoration-4 underline underline-offset-4">{safeAge}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-[10px] font-black uppercase tracking-[0.2em] drop-shadow">
                <MapPin size={14} className="text-[#22eb7e]" />
                <span>{safeLocation}</span>
              </div>
            </div>
            <div className="size-14 glass rounded-2xl flex items-center justify-center text-slate-900 shadow-xl pointer-events-auto active:scale-95 transition-transform cursor-pointer">
              <Info size={24} strokeWidth={2.5} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <div className="px-4 py-2 glass !bg-[#102217]/60 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
              {safeBreed}
            </div>
            {dog?.is_castrated && (
              <div className="px-4 py-2 glass !bg-[#22eb7e]/20 rounded-xl text-[#22eb7e] border border-[#22eb7e]/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} />
                Castrado
              </div>
            )}
          </div>

          {dog?.traits && (
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(dog.traits) ? dog.traits : dog.traits.split(',')).slice(0, 3).map((trait: string) => (
                <span key={trait} className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-black text-white/90 border border-white/10 tracking-widest uppercase">
                  {trait.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
