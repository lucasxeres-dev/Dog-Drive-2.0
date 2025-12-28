import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useSupabase } from '../hooks/useSupabase';
import { Skeleton, EmptyState, PremiumButton } from '../components/UIComponents';
import SwipeCard from '../components/SwipeCard';
import FilterModal from '../components/FilterModal';
import {
    Dog as DogIcon, X, Heart, Star,
    RotateCcw, Bone, Sparkles, Filter,
    MessageCircle, MapPin, Search, Info,
    Zap
} from 'lucide-react';

const FeedView: React.FC = () => {
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const supabase = useSupabase();
    const [dogs, setDogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        breed: '',
        size: '',
        maxDistance: 50
    });

    useEffect(() => {
        fetchDogs();
    }, [filters]);

    const fetchDogs = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            let query = supabase
                .from('dogs')
                .select(`
                    *,
                    owner:profiles(full_name, avatar_url)
                `);

            if (user) {
                query = query.neq('owner_id', user.id);
            }

            if (filters.breed) query = query.ilike('breed', `%${filters.breed}%`);
            if (filters.size) query = query.eq('size', filters.size);

            const { data, error } = await query.limit(20);

            if (error) throw error;
            setDogs(data || []);
            setCurrentIndex(0);
        } catch (error: any) {
            console.error('Error fetching dogs:', error);
            showNotification('Erro ao carregar os pets', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSwipe = async (direction: 'left' | 'right', dogId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            if (direction === 'right') {
                await supabase.from('matches').insert({
                    user_id: user.id,
                    target_dog_id: dogId,
                    status: 'liked'
                });
                showNotification('Match! ❤️', 'success');
            }
            setCurrentIndex(prev => prev + 1);
        } catch (err) {
            console.error('Swipe error:', err);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden pb-24">
            {/* Premium Header */}
            <header className="px-6 pt-14 pb-6 glass sticky top-0 z-50 border-b border-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <motion.div
                        whileHover={{ rotate: 5, scale: 1.05 }}
                        className="size-12 bg-[#22eb7e] rounded-2xl flex items-center justify-center shadow-glow"
                    >
                        <DogIcon size={26} className="text-[#102217]" strokeWidth={2.5} />
                    </motion.div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">Dog Drive</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="relative flex size-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22eb7e] opacity-75"></span>
                                <span className="relative inline-flex rounded-full size-2 bg-[#19c765]"></span>
                            </span>
                            <p className="text-[10px] font-black text-[#19c765] uppercase tracking-widest leading-none">Vibe Ativa</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="size-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <Filter size={20} />
                    </button>
                    <button
                        className="size-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all active:scale-95 relative"
                    >
                        <MessageCircle size={20} />
                        <div className="absolute -top-1 -right-1 size-4 bg-[#22eb7e] rounded-full border-2 border-white flex items-center justify-center">
                            <div className="size-1.5 bg-[#102217] rounded-full" />
                        </div>
                    </button>
                </div>
            </header>

            {/* Swipe Area */}
            <div className="flex-1 relative flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="relative">
                                <Skeleton className="w-72 h-96 rounded-[2.5rem] shadow-xl" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="size-12 border-4 border-[#22eb7e]/20 border-t-[#22eb7e] rounded-full animate-spin" />
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] animate-pulse">Sincronizando Alcateia...</p>
                        </motion.div>
                    ) : dogs.length > 0 && currentIndex < dogs.length ? (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-md h-[72vh] relative"
                        >
                            <AnimatePresence initial={false}>
                                {dogs.slice(currentIndex, currentIndex + 2).reverse().map((dog, idx) => {
                                    const isTop = idx === 1 || (dogs.length - currentIndex === 1);
                                    return (
                                        <SwipeCard
                                            key={dog.id}
                                            dog={dog}
                                            onSwipe={(dir) => handleSwipe(dir, dog.id)}
                                            isTop={isTop}
                                            index={currentIndex + (idx === 1 ? 0 : 1)}
                                        />
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full"
                        >
                            <EmptyState
                                icon={<Bone size={48} />}
                                title="Fim da Trilha"
                                description="Não encontramos mais cães por perto com os teus filtros atuais. Tenta expandir a busca!"
                                action={{
                                    label: 'Tentar Novamente',
                                    onClick: fetchDogs
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Premium Interaction Buttons */}
            {dogs.length > 0 && currentIndex < dogs.length && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-8 pb-14 flex items-center justify-center gap-8"
                >
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSwipe('left', dogs[currentIndex].id)}
                        className="size-16 rounded-full bg-white shadow-xl shadow-slate-200/60 flex items-center justify-center text-rose-500 border border-slate-50 relative group"
                    >
                        <X size={28} strokeWidth={3} />
                        <div className="absolute inset-0 bg-rose-500/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.15, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSwipe('right', dogs[currentIndex].id)}
                        className="size-24 rounded-full bg-[#22eb7e] shadow-glow flex items-center justify-center text-[#102217] relative overflow-hidden"
                    >
                        <Heart size={42} strokeWidth={2.5} />
                        <motion.div
                            animate={{ opacity: [0, 0.5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-white"
                        />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="size-16 rounded-full bg-slate-900 shadow-xl shadow-slate-900/20 flex items-center justify-center text-[#22eb7e] relative group"
                    >
                        <Zap size={28} strokeWidth={2.5} />
                        <div className="absolute inset-0 bg-[#22eb7e]/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
                    </motion.button>
                </motion.div>
            )}

            {isFilterOpen && (
                <FilterModal
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    initialDistance={filters.maxDistance}
                    onApply={(newFilters: any) => {
                        setFilters({ ...filters, ...newFilters });
                        setIsFilterOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default FeedView;
