import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useSupabase } from '../hooks/useSupabase';
import SwipeCard from '../components/SwipeCard';
import FilterModal from '../components/FilterModal';
import {
    Dog as DogIcon, X, Heart, Star,
    RotateCcw, Bone, Sparkles, Filter,
    MessageCircle, MapPin
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
            {/* Header */}
            <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-[#22eb7e] to-[#1ed170] rounded-[14px] flex items-center justify-center shadow-lg shadow-[#22eb7e]/30">
                        <DogIcon size={24} className="text-[#102217]" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Dog Drive</h1>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <div className="w-1 h-1 rounded-full bg-[#2e9c60] animate-pulse" />
                            <p className="text-[10px] font-black text-[#2e9c60] uppercase tracking-widest leading-none">Comunidade Ativa</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 active:scale-95 transition-all border border-slate-200/50 shadow-sm"
                    >
                        <Filter size={20} />
                    </button>
                    <button
                        className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 active:scale-95 transition-all border border-slate-200/50 shadow-sm"
                    >
                        <MessageCircle size={20} />
                    </button>
                </div>
            </header>

            {/* Swipe Area */}
            <div className="flex-1 relative flex items-center justify-center p-4">
                {loading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-14 h-14 border-4 border-[#22eb7e] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Buscando pets...</p>
                    </div>
                ) : dogs.length > 0 && currentIndex < dogs.length ? (
                    <div className="w-full max-w-md h-[70vh] relative">
                        <AnimatePresence>
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
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center px-10">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Bone size={48} className="text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Sem mais amiguinhos</h3>
                        <p className="text-slate-400 font-bold mb-8 text-sm">Não encontramos mais cães por perto com os teus filtros atuais.</p>
                        <button
                            onClick={fetchDogs}
                            className="h-16 px-10 bg-[#22eb7e] text-[#102217] rounded-full font-black uppercase text-xs tracking-widest shadow-xl shadow-[#22eb7e]/30 active:scale-95 transition-all flex items-center gap-3"
                        >
                            <RotateCcw size={18} />
                            Ver novamente
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            {dogs.length > 0 && currentIndex < dogs.length && (
                <div className="px-6 pb-12 flex items-center justify-center gap-6">
                    <button
                        onClick={() => handleSwipe('left', dogs[currentIndex].id)}
                        className="w-16 h-16 rounded-full bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-rose-500 active:scale-90 transition-all border border-slate-50"
                    >
                        <X size={32} strokeWidth={3} />
                    </button>
                    <button
                        onClick={() => handleSwipe('right', dogs[currentIndex].id)}
                        className="w-20 h-20 rounded-full bg-[#22eb7e] shadow-xl shadow-[#22eb7e]/30 flex items-center justify-center text-[#102217] active:scale-90 transition-all"
                    >
                        <Heart size={36} strokeWidth={2.5} />
                    </button>
                    <button
                        className="w-16 h-16 rounded-full bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-amber-500 active:scale-90 transition-all border border-slate-50"
                    >
                        <Star size={32} strokeWidth={2.5} />
                    </button>
                </div>
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
