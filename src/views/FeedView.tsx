import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useSupabase } from '../hooks/useSupabase';
import { Skeleton, EmptyState, PremiumButton } from '../components/UIComponents';
import ProfessionalSwipeCard from '../components/ProfessionalSwipeCard';
import OnboardingTutorial from '../components/OnboardingTutorial';
import FilterModal from '../components/FilterModal';
import { UserProfile, Match } from '../types';
import {
    Dog as DogIcon, X, Heart, Star,
    RotateCcw, Bone, Sparkles, Filter,
    MessageCircle, MapPin, Search, Info,
    Zap, Footprints, Home, Scissors
} from 'lucide-react';

const FeedView: React.FC = () => {
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const supabase = useSupabase();
    const navigate = useNavigate();

    const [currentCategory, setCurrentCategory] = useState<'walker' | 'hotel' | 'groomer'>('walker');
    const [professionals, setProfessionals] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    const [filters, setFilters] = useState({
        maxDistance: 50
    });

    useEffect(() => {
        const tutorialDone = localStorage.getItem('dogdrive_tutorial_done');
        if (!tutorialDone) setShowTutorial(true);
    }, []);

    useEffect(() => {
        fetchProfessionals();
    }, [currentCategory, filters]);

    const fetchProfessionals = async () => {
        setLoading(true);
        try {
            let data: any[] = [];

            if (currentCategory === 'walker') {
                const { data: res, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'provider')
                    .contains('provider_services', ['Passeador']);
                if (error) throw error;
                data = res;
            } else if (currentCategory === 'hotel') {
                const { data: res, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'provider')
                    .contains('provider_services', ['Hospedagem']);
                if (error) throw error;
                data = res;
            } else if (currentCategory === 'groomer') {
                const { data: res, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'business')
                    .eq('business_type', 'grooming');
                if (error) throw error;
                data = res;
            }

            // Enhanced data with random mapping for demo if empty, and sorting by rating
            const processed = (data || []).map(p => ({
                ...p,
                rating: p.rating || (4.5 + Math.random() * 0.5),
                company_name: p.business_name || p.full_name,
                img_url: p.avatar_url,
                tags: p.provider_services || ['Verificado', 'Premium']
            })).sort((a, b) => b.rating - a.rating);

            setProfessionals(processed);
            setCurrentIndex(0);
        } catch (error: any) {
            console.error('Error fetching professionals:', error);
            showNotification('Erro ao carregar profissionais', 'error');
        } finally {
            setLoading(false);
        }
    };



    const handleSwipe = async (direction: 'left' | 'right', targetId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            if (direction === 'right') {
                // Register interest in matches table
                await supabase.from('matches').insert({
                    user_id: user.id,
                    target_profile_id: targetId,
                    status: 'liked',
                    match_type: currentCategory
                });
                showNotification('Interesse enviado! ❤️', 'success');
            }
            setCurrentIndex(prev => prev + 1);
        } catch (err) {
            console.error('Swipe error:', err);
        }
    };

    const handleCompleteTutorial = () => {
        localStorage.setItem('dogdrive_tutorial_done', 'true');
        setShowTutorial(false);
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden pb-24">
            <AnimatePresence>
                {showTutorial && <OnboardingTutorial onComplete={handleCompleteTutorial} />}
            </AnimatePresence>

            {/* Premium Header */}
            <header className="px-6 pt-14 pb-4 glass sticky top-0 z-50 border-b border-white">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <motion.div
                            whileHover={{ rotate: 5, scale: 1.05 }}
                            className="size-12 bg-[#22eb7e] rounded-2xl flex items-center justify-center shadow-glow"
                        >
                            <DogIcon size={26} className="text-[#102217]" strokeWidth={2.5} />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">Dog Drive</h1>
                            <p className="text-[10px] font-black text-[#19c765] uppercase tracking-widest mt-1.5">Área do Dono</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="size-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                        >
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Sub-Header: Horizontal Category Tabs */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { id: 'walker', label: 'Passeadores', icon: Footprints },
                        { id: 'hotel', label: 'Hotéis', icon: Home },
                        { id: 'groomer', label: 'Groomers', icon: Scissors }
                    ].map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCurrentCategory(cat.id as any)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 ${currentCategory === cat.id ? 'bg-[#102217] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                        >
                            <cat.icon size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            {/* Swipe Area */}
            <div className="flex-1 relative flex items-center justify-center p-6 pb-12">
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
                                <Skeleton className="w-72 h-[60vh] rounded-[3rem] shadow-xl" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="size-12 border-4 border-[#22eb7e]/20 border-t-[#22eb7e] rounded-full animate-spin" />
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] animate-pulse">Buscando Melhores Parceiros...</p>
                        </motion.div>
                    ) : professionals.length > 0 && currentIndex < professionals.length ? (
                        <motion.div
                            key={`${currentCategory}-${currentIndex}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-md h-[65vh] relative"
                        >
                            <AnimatePresence initial={false}>
                                {professionals.slice(currentIndex, currentIndex + 2).reverse().map((prof, idx) => {
                                    const isTop = idx === 1 || (professionals.length - currentIndex === 1);
                                    return (
                                        <ProfessionalSwipeCard
                                            key={prof.id}
                                            data={prof}
                                            onSwipe={(dir) => handleSwipe(dir, prof.id)}
                                            isTop={isTop}
                                            type={currentCategory}
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
                                icon={<Sparkles size={48} />}
                                title="Fim da Lista"
                                description={`Já viu todos os ${currentCategory === 'walker' ? 'passeadores' : currentCategory === 'hotel' ? 'hotéis' : 'groomers'} por perto.`}
                                action={{
                                    label: 'Recarregar',
                                    onClick: fetchProfessionals
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Premium Interaction Buttons */}
            {professionals.length > 0 && currentIndex < professionals.length && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-8 pb-14 flex items-center justify-center gap-8"
                >
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSwipe('left', professionals[currentIndex].id)}
                        className="size-16 rounded-full bg-white shadow-xl shadow-slate-200/60 flex items-center justify-center text-rose-500 border border-slate-50 relative group"
                    >
                        <X size={28} strokeWidth={3} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.15, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSwipe('right', professionals[currentIndex].id)}
                        className="size-24 rounded-full bg-[#22eb7e] shadow-glow flex items-center justify-center text-[#102217] relative"
                    >
                        <Heart size={42} strokeWidth={2.5} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(`/profile/${professionals[currentIndex].id}`)}
                        className="size-16 rounded-full bg-slate-900 shadow-xl shadow-slate-900/20 flex items-center justify-center text-[#22eb7e] relative group"
                    >
                        <Info size={28} strokeWidth={2.5} />
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
