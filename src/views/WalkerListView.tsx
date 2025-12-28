import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useSupabase } from '../hooks/useSupabase';
import { ArrowLeft, Filter, Search, ShieldCheck, MapPin, Star } from 'lucide-react';
import FilterModal from '../components/FilterModal';

const WalkerListView: React.FC = () => {
    const navigate = useNavigate();
    const routerLocation = useRouterLocation();
    const query = new URLSearchParams(routerLocation.search);
    const serviceFilter = query.get('service') || 'walking';

    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const supabaseClient = useSupabase();

    const [sortBy, setSortBy] = useState<'nearby' | 'top_rated' | 'lowest_price'>('nearby');
    const [walkers, setWalkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showFilters, setShowFilters] = useState(false);
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [locationName, setLocationName] = useState<string>('Rio de Janeiro');

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
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
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude: lat, longitude: lng } = pos.coords;
                    setLocation({ lat, lng });
                    reverseGeocode(lat, lng);
                },
                (err) => console.error('Geolocation error:', err)
            );
        }
    }, []);

    useEffect(() => {
        const fetchWalkers = async () => {
            setLoading(true);
            try {
                let queryBuilder = supabaseClient.from('profiles').select('*');

                if (serviceFilter === 'walking') {
                    queryBuilder = queryBuilder.eq('role', 'provider').contains('provider_services', ['Passeador']);
                } else if (serviceFilter === 'boarding') {
                    queryBuilder = queryBuilder.eq('role', 'provider').contains('provider_services', ['Hospedagem']);
                } else if (serviceFilter === 'grooming') {
                    queryBuilder = queryBuilder.eq('role', 'business').eq('business_type', 'grooming');
                } else if (serviceFilter === 'clinic') {
                    queryBuilder = queryBuilder.eq('role', 'business').eq('business_type', 'clinic');
                }

                const { data, error } = await queryBuilder;

                if (error) throw error;

                if (data) {
                    const enhanced = data.map((w: any) => {
                        let dist = 999;
                        if (location && w.latitude && w.longitude) {
                            dist = calculateDistance(location.lat, location.lng, w.latitude, w.longitude);
                        }

                        return {
                            ...w,
                            name: w.business_name || w.full_name,
                            specialty: w.business_type === 'clinic' ? 'Hospital Veterinário 24h' :
                                w.business_type === 'grooming' ? 'Estética e Bem-estar' :
                                    w.bio?.substring(0, 45) + (w.bio?.length > 45 ? '...' : '') || 'Especialista Pet',
                            price: w.business_type !== 'none' ? 120 : 35,
                            dist: dist,
                            rating: 4.8 + (Math.random() * 0.2),
                            img: w.avatar_url || (w.business_type === 'clinic' ? 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=200' : 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg')
                        };
                    });
                    setWalkers(enhanced);
                }
            } catch (err: any) {
                showNotification(err.message || 'Erro ao carregar colaboradores', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchWalkers();
    }, [location, serviceFilter, supabaseClient, showNotification]);

    const sortedWalkers = useMemo(() => {
        const list = [...walkers];
        if (sortBy === 'nearby') return list.sort((a, b) => a.dist - b.dist);
        if (sortBy === 'top_rated') return list.sort((a, b) => b.rating - a.rating);
        if (sortBy === 'lowest_price') return list.sort((a, b) => a.price - b.price);
        return list;
    }, [sortBy, walkers]);

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden pb-16 animate-fade-in">
            <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-white shadow-sm shadow-slate-200/30">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 active:scale-90 transition-all border border-slate-200/50"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{t('find_walker')}</h1>
                        <p className="text-[10px] font-black text-[#22eb7e] uppercase tracking-widest mt-1">{locationName}</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowFilters(true)}
                    className="w-10 h-10 rounded-xl bg-[#22eb7e]/10 text-[#22eb7e] flex items-center justify-center active:scale-90 transition-all"
                >
                    <Filter size={20} />
                </button>
            </header>

            <div className="px-6 py-6">
                <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        className="input-premium pl-14"
                        placeholder={t('search_walker')}
                    />
                </div>
            </div>

            <div className="flex gap-3 px-6 pb-6 overflow-x-auto no-scrollbar">
                {[
                    { id: 'nearby', label: t('nearby') },
                    { id: 'top_rated', label: t('top_rated') },
                    { id: 'lowest_price', label: t('lowest_price') }
                ].map(sort => (
                    <button
                        key={sort.id}
                        onClick={() => setSortBy(sort.id as any)}
                        className={`h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${sortBy === sort.id ? 'bg-[#102217] text-white shadow-lg shadow-slate-200' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                    >
                        {sort.label}
                    </button>
                ))}
            </div>

            <main className="flex-1 overflow-y-auto px-6 pb-28 space-y-4 no-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-[#22eb7e] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest animate-pulse">Buscando colaboradores...</p>
                    </div>
                ) : sortedWalkers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <Search size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Nenhum colaborador encontrado</h3>
                        <p className="text-sm font-bold text-slate-400 max-w-[200px]">Tente ajustar seus filtros ou mudar de localização.</p>
                    </div>
                ) : sortedWalkers.map(walker => (
                    <div
                        key={walker.id}
                        onClick={() => navigate(`/booking/${walker.id}`)}
                        className="flex items-center p-5 bg-white rounded-[2.5rem] shadow-sm border border-white hover:border-[#22eb7e]/30 transition-all cursor-pointer group"
                    >
                        <div className="relative shrink-0">
                            <img className="h-20 w-20 rounded-3xl object-cover group-hover:scale-105 transition-transform duration-500" src={walker.img} alt={walker.name} />
                            <div className="absolute -bottom-1 -right-1 bg-[#22eb7e] rounded-full w-5 h-5 border-2 border-white flex items-center justify-center">
                                <ShieldCheck size={10} className="text-[#102217]" strokeWidth={3} />
                            </div>
                        </div>
                        <div className="flex-1 px-5 flex flex-col justify-center">
                            <h3 className="text-lg font-black text-[#102217] leading-tight mb-1">{walker.name}</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest line-clamp-1 mb-2">{walker.specialty}</p>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-[#2e9c60] uppercase tracking-widest">
                                    <MapPin size={12} strokeWidth={3} />
                                    {walker.dist === 999 ? '...' : (walker.dist < 1 ? t('under_1km') || 'Perto' : `${walker.dist.toFixed(1)}km`)}
                                </span>
                                <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                <span className="text-sm font-black text-[#102217]">
                                    €{walker.price}
                                    <span className="text-slate-300 font-bold text-[10px] ml-1 uppercase">{t('per_hour')}</span>
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#22eb7e]/10 px-3 py-2 rounded-2xl">
                            <Star size={14} className="text-[#2e9c60] fill-[#2e9c60]" />
                            <span className="text-[#2e9c60] text-xs font-black">{walker.rating.toFixed(1)}</span>
                        </div>
                    </div>
                ))}
            </main>

            {showFilters && (
                <FilterModal
                    isOpen={showFilters}
                    onClose={() => setShowFilters(false)}
                    onApply={(filters) => {
                        console.log('Filters applied:', filters);
                        setShowFilters(false);
                    }}
                />
            )}
        </div>
    );
};

export default WalkerListView;
