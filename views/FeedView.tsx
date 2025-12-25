
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { useTranslation } from '../LanguageContext';
import { Dog } from '../types';
import { MOCK_DOGS } from '../constants';

const FeedView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [maxDistance, setMaxDistance] = useState(10);
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [locationName, setLocationName] = useState<string>('Rio de Janeiro');

    useEffect(() => {
        // Fetch current position
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    // Mock reverse geocoding
                    setLocationName('Sua Localização');
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setLocationName('Rio de Janeiro');
                }
            );
        }

        const fetchDogs = async () => {
            setLoading(true);

            if (!isSupabaseConfigured) {
                setDogs(MOCK_DOGS);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('dogs')
                    .select('*');

                if (!error && data && data.length > 0) {
                    setDogs(data as Dog[]);
                } else {
                    setDogs(MOCK_DOGS);
                }
            } catch (err) {
                console.error('Supabase fetch failed, falling back to mock dogs', err);
                setDogs(MOCK_DOGS);
            }
            setLoading(false);
        };

        fetchDogs();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark font-display h-screen overflow-hidden">
            <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 pt-6 pb-4 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-primary">DOG DRIVE</h1>
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest opacity-50">
                            <span className="material-symbols-outlined text-[12px]">location_on</span>
                            {locationName}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowFilters(true)}
                        className="flex size-11 items-center justify-center rounded-2xl bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/5 active:scale-90 transition-transform"
                    >
                        <span className="material-symbols-outlined text-2xl">tune</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar px-4 pb-24 pt-2">
                <div className="grid grid-cols-1 gap-6">
                    {dogs.map((dog) => (
                        <div
                            key={dog.id}
                            onClick={() => navigate(`/dog/${dog.id}`)}
                            className="group relative w-full aspect-[4/5] bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-xl shadow-black/5 overflow-hidden border border-gray-100 dark:border-white/5"
                        >
                            <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url(${dog.imageUrl})` }}></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                                    {dog.match}% Match
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                <div className="flex items-end justify-between mb-2">
                                    <div>
                                        <h2 className="text-3xl font-black leading-tight tracking-tight">
                                            {dog.name}, <span className="font-light opacity-80">{dog.age}</span>
                                        </h2>
                                        <p className="text-xs font-bold uppercase tracking-widest opacity-60 mt-1">{dog.breed}</p>
                                    </div>
                                    <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-[#102217] shadow-lg shadow-primary/20">
                                        <span className="material-symbols-outlined fill-current text-2xl">favorite</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-4 py-4 border-t border-white/10">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-black opacity-40">Distance</span>
                                        <span className="text-sm font-bold tracking-tight">{dog.distance}</span>
                                    </div>
                                    <div className="w-px h-8 bg-white/10"></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-black opacity-40">Location</span>
                                        <span className="text-sm font-bold tracking-tight">{dog.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Filter Modal */}
            {showFilters && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-6 bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-[3rem] p-8 shadow-2xl animate-slideUp">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black tracking-tight">{t('filter_preferences')}</h3>
                            <button onClick={() => setShowFilters(false)} className="size-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-black uppercase tracking-widest opacity-50">{t('max_distance')}</label>
                                    <span className="text-primary font-black">{maxDistance} km</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={maxDistance}
                                    onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full appearance-none accent-primary cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-black uppercase tracking-widest opacity-50 mb-4 block">{t('location_filter')}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Copacabana', 'Ipanema', 'Leblon', 'Barra'].map(loc => (
                                        <button key={loc} className="py-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-sm font-bold border border-transparent hover:border-primary/30 transition-all">
                                            {loc}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowFilters(false)}
                                className="w-full py-5 bg-primary text-[#102217] font-black rounded-3xl shadow-xl shadow-primary/20 active:scale-95 transition-all mt-4"
                            >
                                {t('apply_filters')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
};

export default FeedView;
