
import React from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { Dog } from '../types';
import { MapPin, Info } from 'lucide-react';

interface SwipeCardProps {
  dog: Dog;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  isFront: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ dog, onSwipeRight, onSwipeLeft, isFront }) => {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);

  // Feedback overlays opacity
  const likeOpacity = useTransform(x, [20, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, -20], [1, 0]);

  const handleDragEnd = async (_event: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;

    if (info.offset.x > threshold || velocity > 500) {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2 } });
      onSwipeRight();
    } else if (info.offset.x < -threshold || velocity < -500) {
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.2 } });
      onSwipeLeft();
    } else {
      controls.start({ x: 0, rotate: 0, transition: { type: 'spring', stiffness: 500, damping: 50 } });
    }
  };

  return (
    <motion.div
      className="absolute w-full h-[65vh] rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-gray-100 dark:border-white/5"
      style={{
        x,
        rotate,
        opacity,
        zIndex: isFront ? 10 : 0,
        scale: isFront ? 1 : 0.95,
        top: 0
      }}
      drag={isFront ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileTap={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Background */}
      <div className="relative w-full h-full">
        <img
          src={dog.image_url}
          alt={dog.name}
          className="w-full h-full object-cover pointer-events-none"
          draggable="false"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

        {/* LIKE / NOPE Overlays */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-10 left-8 border-4 border-green-500 rounded-xl px-4 py-2 transform -rotate-12 z-20 pointer-events-none"
        >
          <span className="text-green-500 text-4xl font-black uppercase tracking-widest">LIKE</span>
        </motion.div>

        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-10 right-8 border-4 border-red-500 rounded-xl px-4 py-2 transform rotate-12 z-20 pointer-events-none"
        >
          <span className="text-red-500 text-4xl font-black uppercase tracking-widest">NOPE</span>
        </motion.div>

        {/* Info Container */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white pointer-events-none">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="text-4xl font-black tracking-tight drop-shadow-md flex items-end gap-3">
                {dog.name}
                <span className="text-2xl font-bold opacity-90">{dog.age}</span>
              </h2>
              <p className="text-lg font-medium opacity-90">{dog.breed}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2">
              <Info className="text-white" size={24} />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 opacity-80">
            <MapPin size={18} className="text-primary" />
            <span className="text-sm font-bold tracking-wide">{dog.distance} • {dog.location}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {Array.isArray(dog.traits) && dog.traits.map((trait, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider border border-white/10"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
