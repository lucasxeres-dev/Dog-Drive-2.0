import React from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ children, onSwipeLeft, onSwipeRight, className = "" }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      onSwipeLeft?.();
    } else if (info.offset.x > 100) {
      onSwipeRight?.();
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.05 }}
      className={`absolute inset-0 cursor-grab active:cursor-grabbing ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default SwipeCard;
