import React from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Dog } from '../types';

interface SwipeCardProps {
  dog: Dog;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ dog, onSwipe, isTop }) => {
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
      <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-slate-200/50 border border-slate-50">
        {/* Image */}
        <img
          src={safeImage}
          alt={safeName}
          className="h-full w-full object-cover grayscale-[0.05]"
        />

        {/* Overlays */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-10 left-10 px-6 py-2 border-4 border-[#22eb7e] rounded-2xl transform -rotate-12 z-20 pointer-events-none"
        >
          <span className="text-4xl font-black text-[#22eb7e] uppercase">MATCH</span>
        </motion.div>

        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-10 right-10 px-6 py-2 border-4 border-rose-500 rounded-2xl transform rotate-12 z-20 pointer-events-none"
        >
          <span className="text-4xl font-black text-rose-500 uppercase">NOPE</span>
        </motion.div>

        {/* Bottom Info */}
        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white pointer-events-none">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-black">{safeName}, {safeAge}</h2>
            <div className="w-10 h-10 bg-[#22eb7e] rounded-xl flex items-center justify-center text-[#102217]">
              <span className="material-symbols-outlined font-black">pets</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest">{safeBreed}</span>
            {dog?.is_castrated && (
              <span className="px-3 py-1 rounded-full bg-[#22eb7e]/30 text-[#22eb7e] border border-[#22eb7e]/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 backdrop-blur-md">
                <span className="material-symbols-outlined text-[14px]">vaccines</span>
                Castrado
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-white/70 text-sm font-medium">
            <span className="material-symbols-outlined text-base">location_on</span>
            <span>{safeLocation}</span>
          </div>

          {dog?.traits && (
            <div className="mt-4 flex flex-wrap gap-2">
              {(Array.isArray(dog.traits) ? dog.traits : dog.traits.split(',')).slice(0, 3).map((trait: string) => (
                <span key={trait} className="px-3 py-1 bg-black/40 rounded-lg text-[10px] font-bold text-white/90 backdrop-blur-sm">
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
