import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    Search,
    Navigation,
    ChevronLeft,
    Footprints,
    Home,
    Scissors,
    ShoppingBag,
    Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MapView: React.FC = () => {
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const locations = [
        { id: 1, type: 'walk', name: 'Buddy Walking', rating: 4.8, x: '25%', y: '30%', icon: Footprints, color: 'bg-blue-500' },
        { id: 2, type: 'shop', name: 'Pet Super Store', rating: 4.5, x: '65%', y: '45%', icon: ShoppingBag, color: 'bg-green-500' },
        { id: 3, type: 'boarding', name: 'Happy Paws Hotel', rating: 4.9, x: '40%', y: '70%', icon: Home, color: 'bg-purple-500' },
        { id: 4, type: 'grooming', name: 'Spets Grooming', rating: 4.7, x: '80%', y: '20%', icon: Scissors, color: 'bg-pink-500' },
    ];

    const selectedLocation = locations.find(l => l.id === selectedId);

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-900 relative">
            {/* Map Placeholder with premium look */}
            <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-[#111827] opacity-80" />
                {/* SVG Mock Map Grid */}
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100">
                    <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.1" />
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />
                </svg>

                {/* Simulated Parks/Rivers */}
                <div className="absolute top-[20%] left-[10%] w-[30%] h-[15%] bg-green-900/20 rounded-[4rem] blur-2xl" />
                <div className="absolute bottom-[30%] right-[10%] w-[40%] h-[20%] bg-blue-900/10 rounded-[5rem] blur-3xl" />
            </div>

            {/* Header / Search */}
            <div className="absolute top-0 left-0 right-0 p-6 z-20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="size-12 rounded-2xl bg-slate-800/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            placeholder="Buscar serviços próximos..."
                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-800/80 backdrop-blur-xl border border-white/10 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4">
                    {['Todos', 'Passeios', 'Lojas', 'Hospedagem'].map((cat, i) => (
                        <button key={i} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${i === 0 ? 'bg-primary text-white' : 'bg-slate-800/80 backdrop-blur-md text-white/60 border border-white/5'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Map Markers */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                {locations.map((loc) => (
                    <motion.button
                        key={loc.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={() => setSelectedId(loc.id)}
                        className="absolute pointer-events-auto active:scale-90 transition-transform"
                        style={{ left: loc.x, top: loc.y }}
                    >
                        <div className={`relative flex items-center justify-center`}>
                            <div className={`size-10 rounded-full ${loc.color} shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center text-white border-2 border-slate-900 relative z-10`}>
                                <loc.icon size={18} />
                            </div>
                            <div className={`absolute inset-0 rounded-full ${loc.color} animate-ping opacity-20`} />
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Floating Selection Card */}
            <AnimatePresence>
                {selectedLocation && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-10 left-6 right-6 z-30"
                    >
                        <div className="glass-card !bg-slate-900/90 !border-white/10 p-5 flex items-center gap-4">
                            <div className={`size-16 rounded-[1.5rem] ${selectedLocation.color} flex items-center justify-center text-white shadow-lg`}>
                                <selectedLocation.icon size={32} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-black tracking-tight">{selectedLocation.name}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                    <span className="text-white text-xs font-bold">{selectedLocation.rating}</span>
                                    <span className="text-slate-400 text-[10px]">• 0.8 km de distância</span>
                                </div>
                                <button className="mt-3 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                    Agendar Agora <ChevronLeft size={10} className="rotate-180" />
                                </button>
                            </div>
                            <button
                                onClick={() => setSelectedId(null)}
                                className="absolute top-4 right-4 text-slate-500 hover:text-white"
                            >
                                <ChevronLeft size={20} className="rotate-90" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* GPS FAB */}
            <button className="absolute bottom-10 right-6 size-14 rounded-[1.5rem] bg-primary shadow-2xl shadow-primary/40 flex items-center justify-center text-white z-20 active:scale-95 transition-transform">
                <Navigation size={24} fill="currentColor" />
            </button>
        </div>
    );
};

export default MapView;
