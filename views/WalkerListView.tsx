import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../LanguageContext';
import { supabase } from '../supabaseClient';
import FilterModal from '../components/FilterModal';

const WalkerListView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [sortBy, setSortBy] = useState<'nearby' | 'top_rated' | 'lowest_price'>('nearby');
    const [walkers, setWalkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchWalkers = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'provider');

            if (!error && data && data.length > 0) {
                // Add some pseudo-data for display (rating, price, dist)
                const enhanced = data.map(w => ({
                    ...w,
                    name: w.full_name,
                    specialty: 'Pet Specialist',
                    price: 35, // Default price
                    dist: Math.floor(Math.random() * 5) + 1,
                    rating: 4.8 + (Math.random() * 0.2),
                    img: w.avatar_url || 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg'
                }));
                setWalkers(enhanced);
            } else {
                // Fallback to mocks for vibrant presentation
                setWalkers([
                    { id: 'w1', name: 'Ana Silva', specialty: 'Large breeds specialist', price: 30, dist: 2, rating: 5.0, img: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg' },
                    { id: 'w2', name: 'John Doe', specialty: 'Active runner & trainer', price: 25, dist: 5, rating: 4.8, img: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg' },
                    { id: 'w3', name: 'Beatriz Costa', specialty: 'Small dogs & puppies', price: 40, dist: 1, rating: 4.9, img: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg' }
                ]);
            }
            setLoading(false);
        };
        fetchWalkers();
    }, []);

    const sortedWalkers = useMemo(() => {
        const list = [...walkers];
        if (sortBy === 'nearby') return list.sort((a, b) => a.dist - b.dist);
        if (sortBy === 'top_rated') return list.sort((a, b) => b.rating - a.rating);
        if (sortBy === 'lowest_price') return list.sort((a, b) => a.price - b.price);
        return list;
    }, [sortBy, walkers]);

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark font-display h-screen overflow-hidden">
            <header className="flex items-center px-6 py-4 pt-6 justify-between sticky top-0 z-10 bg-background-light/90 backdrop-blur-md">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5"><span className="material-symbols-outlined">arrow_back</span></button>
                <h2 className="text-xl font-bold flex-1 text-center pr-2">{t('find_walker')}</h2>
                <button
                    onClick={() => setShowFilters(true)}
                    className="p-2 rounded-full bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/10 active:scale-90 transition-all text-primary"
                >
                    <span className="material-symbols-outlined">tune</span>
                </button>
            </header>

            <div className="px-6 pb-2">
                <div className="flex items-center w-full rounded-full h-14 bg-white dark:bg-surface-dark shadow-sm border border-transparent focus-within:border-primary/50 px-5">
                    <span className="material-symbols-outlined text-gray-400">search</span>
                    <input className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-base font-medium" placeholder={t('search_walker')} />
                </div>
            </div>

            <div className="flex gap-3 px-6 py-4 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setSortBy('nearby')}
                    className={`flex h-10 shrink-0 items-center justify-center rounded-full px-5 text-sm font-bold transition-all ${sortBy === 'nearby' ? 'bg-[#111814] text-white dark:bg-primary dark:text-[#111814]' : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 text-[#111814] dark:text-gray-200'}`}
                >
                    {t('nearby')}
                </button>
                <button
                    onClick={() => setSortBy('top_rated')}
                    className={`flex h-10 shrink-0 items-center justify-center rounded-full px-5 text-sm font-bold transition-all ${sortBy === 'top_rated' ? 'bg-[#111814] text-white dark:bg-primary dark:text-[#111814]' : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 text-[#111814] dark:text-gray-200'}`}
                >
                    {t('top_rated')}
                </button>
                <button
                    onClick={() => setSortBy('lowest_price')}
                    className={`flex h-10 shrink-0 items-center justify-center rounded-full px-5 text-sm font-bold transition-all ${sortBy === 'lowest_price' ? 'bg-[#111814] text-white dark:bg-primary dark:text-[#111814]' : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 text-[#111814] dark:text-gray-200'}`}
                >
                    {t('lowest_price')}
                </button>
            </div>

            <main className="flex-1 overflow-y-auto px-6 pb-28 space-y-4 no-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : sortedWalkers.map(walker => (
                    <div key={walker.id} onClick={() => navigate(`/booking/${walker.id}`)} className="flex items-center p-4 bg-white dark:bg-surface-dark rounded-3xl shadow-sm border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                        <div className="relative shrink-0">
                            <img className="h-16 w-16 rounded-2xl object-cover" src={walker.img} alt={walker.name} />
                            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full size-3 border-2 border-white"></div>
                        </div>
                        <div className="flex-1 px-4 flex flex-col">
                            <h3 className="text-lg font-bold">{walker.name}</h3>
                            <p className="text-gray-500 text-sm font-medium truncate">{walker.specialty}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider"><span className="material-symbols-outlined text-[14px]">location_on</span>{walker.dist}km</span>
                                <div className="size-1 rounded-full bg-gray-300"></div>
                                <span className="text-sm font-bold">R${walker.price}<span className="text-gray-400 font-normal text-xs">{t('per_hour')}</span></span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-primary px-2.5 py-1 rounded-full shadow-sm">
                            <span className="material-symbols-outlined text-[16px] text-[#0a2e16] fill-1">star</span>
                            <span className="text-[#0a2e16] text-sm font-bold">{walker.rating}</span>
                        </div>
                    </div>
                ))}
            </main>

            <FilterModal
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                onApply={(filters) => {
                    console.log('Filters applied:', filters);
                    setShowFilters(false);
                }}
            />
        </div>
    );
};

export default WalkerListView;
