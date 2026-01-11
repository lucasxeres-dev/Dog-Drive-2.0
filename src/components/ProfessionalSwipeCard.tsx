import React from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MapPin, Star, ShieldCheck, Footprints, Home, Scissors } from 'lucide-react';

import { UserProfile } from '../types';

interface ProfessionalSwipeCardProps {
    data: Partial<UserProfile> & { img_url?: string; company_name?: string; tags?: string[] };
    onSwipe: (direction: 'left' | 'right') => void;
    isTop: boolean;
    type: 'walker' | 'hotel' | 'groomer';
}

const ProfessionalSwipeCard: React.FC<ProfessionalSwipeCardProps> = ({ data, onSwipe, isTop, type }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
    const likeOpacity = useTransform(x, [50, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
            onSwipe('right');
        } else if (info.offset.x < -threshold) {
            onSwipe('left');
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'walker': return <Footprints className="text-[#22eb7e]" size={16} />;
            case 'hotel': return <Home className="text-[#22eb7e]" size={16} />;
            case 'groomer': return <Scissors className="text-[#22eb7e]" size={16} />;
            default: return null;
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
                        src={data.avatar_url || data.img_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800'}
                        alt={data.full_name || data.company_name}
                        className="h-full w-full object-cover transition-transform duration-[15s] group-hover:scale-110"
                    />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                {/* Swipe Indicators */}
                <motion.div
                    style={{ opacity: likeOpacity }}
                    className="absolute top-12 left-12 px-6 py-2 border-4 border-[#22eb7e] rounded-2xl transform -rotate-12 z-20 pointer-events-none"
                >
                    <span className="text-4xl font-black text-[#22eb7e] uppercase tracking-tighter shadow-glow">QUERO!</span>
                </motion.div>

                <motion.div
                    style={{ opacity: nopeOpacity }}
                    className="absolute top-12 right-12 px-6 py-2 border-4 border-rose-500 rounded-2xl transform rotate-12 z-20 pointer-events-none"
                >
                    <span className="text-4xl font-black text-rose-500 uppercase tracking-tighter">PRÓXIMO</span>
                </motion.div>

                {/* Bottom Info Section */}
                <div className="absolute inset-x-0 bottom-0 p-8 text-white pointer-events-none">
                    <div className="flex flex-col mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1.5 bg-[#22eb7e]/20 backdrop-blur-md px-3 py-1 rounded-full border border-[#22eb7e]/30">
                                <Star size={12} className="text-[#22eb7e] fill-[#22eb7e]" />
                                <span className="text-[#22eb7e] text-xs font-black">{data.rating?.toFixed(1) || '4.9'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                {getIcon()}
                                <span className="text-white text-[10px] font-black uppercase tracking-widest leading-none">
                                    {type === 'walker' ? 'Passeador' : type === 'hotel' ? 'Hospedagem' : 'Groomer'}
                                </span>
                            </div>
                        </div>

                        <h2 className="text-4xl font-black tracking-tighter drop-shadow-lg mb-1">
                            {data.full_name || data.company_name || data.name}
                        </h2>

                        <div className="flex items-center gap-2 text-white/80 text-[10px] font-black uppercase tracking-[0.2em] drop-shadow">
                            <MapPin size={14} className="text-[#22eb7e]" />
                            <span>{data.address || 'Próximo a você'}</span>
                        </div>
                    </div>

                    <p className="text-sm font-medium text-white/70 line-clamp-2 mb-6">
                        {data.bio || data.description || 'Profissional dedicado ao bem-estar e diversão do seu patudo.'}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {(data.tags || ['Premium', 'Verificado']).map((tag: string) => (
                            <span key={tag} className="px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-lg text-[10px] font-black text-white/80 border border-white/5 tracking-widest uppercase">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfessionalSwipeCard;
