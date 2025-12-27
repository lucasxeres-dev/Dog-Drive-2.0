import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import SwipeCard from '../components/SwipeCard';
import { Dog } from '../types';
import { MapPin, SlidersHorizontal, Heart, X, Info } from 'lucide-react';
import FilterModal from '../components/FilterModal';
import { AnimatePresence, motion } from 'framer-motion';

const FeedView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [maxDistance, setMaxDistance] = useState(10);
    const [locationName, setLocationName] = useState<string>('Rio de Janeiro');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchDogsData = async () => {
            setLoading(true);
            try {
                const { data, error } = await (authService as any).supabase
                    .from('dogs')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) {
                    setDogs(data.map((d: any) => ({
                        ...d,
                        imageUrl: d.image_url,
                        distance: '2.5km',
                        match: d.match_percentage || 95
                    })) as Dog[]);
                }
            } catch (err: any) {
                showNotification(err.message || 'Erro ao carregar feeds', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchDogsData();
    }, [user]);

    const handleSwipe = (direction: 'left' | 'right') => {
        if (direction === 'right') {
            showNotification('Matched! ❤️', 'success');
        }
        setCurrentIndex(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    const currentDogs = dogs.slice(currentIndex, currentIndex + 3).reverse();

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark h-screen overflow-hidden">
            <header className="px-6 pt-8 pb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tighter">Dog-Drive</h1>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                        <MapPin size={12} className="text-primary" />
                        {locationName}
                    </div>
                </div>
                <button
                    onClick={() => setShowFilters(true)}
                    className="size-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-center active:scale-90 transition-transform"
                >
                    <SlidersHorizontal size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
            </header>

            <main className="flex-1 relative px-4 mt-4 flex items-center justify-center">
                <AnimatePresence>
                    {currentDogs.length > 0 ? (
                        currentDogs.map((dog, index) => (
                            <SwipeCard
                                key={dog.id}
                                onSwipeLeft={() => handleSwipe('left')}
                                onSwipeRight={() => handleSwipe('right')}
                                className="z-[index]"
                            >
                                <div className="relative w-full h-[65vh] rounded-[3rem] overflow-hidden shadow-2xl">
                                    <img
                                        src={dog.imageUrl}
                                        alt={dog.name}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                    <div className="absolute top-6 right-6">
                                        <div className="glass-card !bg-white/20 !rounded-full px-4 py-1.5 text-[10px] font-black text-white uppercase tracking-wider">
                                            {dog.match}% Match
                                        </div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <h2 className="text-4xl font-black tracking-tight leading-none">
                                                    {dog.name}, <span className="font-light opacity-80">{dog.age}</span>
                                                </h2>
                                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mt-2">{dog.breed}</p>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/dog/${dog.id}`)}
                                                className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-90 transition-transform"
                                            >
                                                <Info size={24} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/10">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-black opacity-40">Distance</span>
                                                <span className="text-sm font-bold tracking-tight">{dog.distance}</span>
                                            </div>
                                            <div className="w-px h-8 bg-white/10" />
                                            <div className="flex flex-col grow">
                                                <span className="text-[10px] uppercase font-black opacity-40">Location</span>
                                                <span className="text-sm font-bold tracking-tight truncate">{dog.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwipeCard>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center text-center p-8"
                        >
                            <div className="size-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                                <Heart size={40} className="text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-xl font-black mb-2">Sem mais pets por perto</h3>
                            <p className="text-sm text-slate-500 max-w-[200px]">Aumente sua distância nas configurações para ver mais!</p>
                            <button
                                onClick={() => setMaxDistance(50)}
                                className="mt-8 px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20"
                            >
                                Recarregar
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {currentDogs.length > 0 && (
                <div className="flex items-center justify-center gap-8 py-10">
                    <button
                        onClick={() => handleSwipe('left')}
                        className="size-16 rounded-full bg-white dark:bg-slate-900 shadow-xl border border-gray-100 dark:border-white/5 flex items-center justify-center text-red-500 active:scale-90 transition-transform"
                    >
                        <X size={32} strokeWidth={3} />
                    </button>
                    <button
                        onClick={() => handleSwipe('right')}
                        className="size-20 rounded-full bg-primary shadow-2xl shadow-primary/40 flex items-center justify-center text-white active:scale-90 transition-transform"
                    >
                        <Heart size={40} fill="currentColor" strokeWidth={0} />
                    </button>
                </div>
            )}

            <FilterModal
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                initialDistance={maxDistance}
                onApply={(filters) => {
                    setMaxDistance(filters.maxDistance);
                    setShowFilters(false);
                }}
            />
        </div>
    );
};

export default FeedView;
