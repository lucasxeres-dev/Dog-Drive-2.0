
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { useTranslation } from '../LanguageContext';
import FilterModal from '../components/FilterModal';
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
    const [locationName, setLocationName] = useState<string>(t('loading_location') || 'Rio de Janeiro');

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.suburb || 'Local Desconhecido';
            setLocationName(city);
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            setLocationName('Rio de Janeiro');
        }
    };

    useEffect(() => {
        // Fetch current position
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude: lat, longitude: lng } = position.coords;
                    setLocation({ lat, lng });
                    reverseGeocode(lat, lng);

                    // Update profile location if authenticated
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase.from('profiles').update({
                            latitude: lat,
                            longitude: lng,
                            last_active: new Date().toISOString()
                        }).eq('id', user.id);
                    }
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
                setDogs([]);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('dogs')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    setDogs(data.map(d => {
                        let distanceStr = 'Calculando...';
                        if (location && d.latitude && d.longitude) {
                            const dist = calculateDistance(location.lat, location.lng, d.latitude, d.longitude);
                            distanceStr = dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`;
                        } else if (d.distance) {
                            distanceStr = d.distance;
                        }

                        return {
                            ...d,
                            imageUrl: d.image_url,
                            distance: distanceStr,
                            match: d.match_percentage || 95
                        };
                    }) as Dog[]);
                }
            } catch (err) {
                console.error('Supabase fetch failed', err);
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
                            <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url(${dog.image_url})` }}></div>
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
                {dogs.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                        <span className="material-symbols-outlined text-6xl mb-4">pets</span>
                        <p className="text-lg font-bold">Nenhum pet encontrado por perto.</p>
                        <p className="text-sm">Tente ajustar seus filtros de distância.</p>
                    </div>
                )}
            </main>

            {/* Filter Modal */}
            <FilterModal
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                initialDistance={maxDistance}
                onApply={(filters) => {
                    setMaxDistance(filters.maxDistance);
                    // Handle location filtering if needed
                    setShowFilters(false);
                }}
            />
        </div>
    );
};

export default FeedView;
