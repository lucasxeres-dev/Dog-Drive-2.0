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
      <div className="relative h-full w-full rounded-[3rem] overflow-hidden bg-white shadow-2xl shadow-slate-200/50 border border-slate-50 group">
        {/* Image */}
        <div className="absolute inset-0 bg-slate-100">
          <img
            src={safeImage}
            alt={safeName}
            className="h-full w-full object-cover transition-transform duration-[10s] group-hover:scale-110"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

        {/* Overlays */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-12 left-12 px-6 py-2 border-4 border-[#22eb7e] rounded-2xl transform -rotate-12 z-20 pointer-events-none"
        >
          <span className="text-4xl font-black text-[#22eb7e] uppercase tracking-tighter">SIM!</span>
        </motion.div>

        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-12 right-12 px-6 py-2 border-4 border-rose-500 rounded-2xl transform rotate-12 z-20 pointer-events-none"
        >
          <span className="text-4xl font-black text-rose-500 uppercase tracking-tighter">NOPE</span>
        </motion.div>

        {/* Badge */}
        {index < 3 && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 z-10">
            <Sparkles size={14} className="text-[#22eb7e]" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Destaque</span>
          </div>
        )}

        {/* Bottom Info */}
        <div className="absolute inset-x-0 bottom-0 p-10 text-white pointer-events-none">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-4xl font-black tracking-tight">{safeName}</h2>
                <span className="text-2xl font-bold opacity-70">{safeAge}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/60 text-xs font-bold uppercase tracking-wider">
                <MapPin size={12} className="text-[#22eb7e]" />
                <span>{safeLocation}</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">
              <Info size={24} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <div className="px-4 py-1.5 rounded-xl bg-white/15 backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-white/10">
              {safeBreed}
            </div>
            {dog?.is_castrated && (
              <div className="px-4 py-1.5 rounded-xl bg-[#22eb7e]/20 backdrop-blur-md text-[#22eb7e] border border-[#22eb7e]/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={12} />
                Castrado
              </div>
            )}
          </div>

          {dog?.traits && (
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(dog.traits) ? dog.traits : dog.traits.split(',')).slice(0, 3).map((trait: string) => (
                <span key={trait} className="px-3 py-1 bg-black/40 rounded-lg text-[10px] font-bold text-white/80 border border-white/5 backdrop-blur-sm">
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
