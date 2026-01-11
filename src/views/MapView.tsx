import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    ChevronLeft,
    Search,
    Navigation,
    Star,
    Home,
    Scissors,
    ShoppingBag,
    X,
    Clock,
    MapPin as MapIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabase } from '../hooks/useSupabase';
import { Skeleton, GlassCard, PremiumButton } from '../components/UIComponents';

// Fix for default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

interface ServicePoint {
    id: string;
    name: string;
    business_id: string;
    role: string;
    latitude: number;
    longitude: number;
    rating: number;
    address: string;
    hours?: string;
}

const UserLocationMarker: React.FC = () => {
    const [position, setPosition] = useState<[number, number] | null>(null);
    const map = useMap();

    useEffect(() => {
        map.locate({ setView: true, maxZoom: 14 });
        map.on('locationfound', (e) => {
            setPosition([e.latlng.lat, e.latlng.lng]);
        });
    }, [map]);

    return position ? (
        <Marker position={position}>
            <Popup>Você está aqui</Popup>
        </Marker>
    ) : null;
};

const MapView: React.FC = () => {
    const navigate = useNavigate();
    const supabase = useSupabase();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [locations, setLocations] = useState<ServicePoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const { data, error } = await supabase
                    .from('business_locations')
                    .select('*, business_profiles(id, company_name, service_type, rating)')
                    .eq('is_active', true);

                if (error) throw error;

                const mapped = (data || [])
                    .filter((l: any) => l.latitude && l.longitude)
                    .map((l: any) => ({
                        id: l.id,
                        business_id: l.business_id,
                        name: l.name || l.business_profiles?.company_name || 'Estabelecimento',
                        role: l.business_profiles?.service_type || 'boarding',
                        latitude: parseFloat(l.latitude),
                        longitude: parseFloat(l.longitude),
                        rating: l.business_profiles?.rating || 4.5 + Math.random() * 0.5,
                        address: l.address,
                        hours: '09:00 - 19:00'
                    }));

                setLocations(mapped);
            } catch (err) {
                console.error('Error fetching map locations:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, [supabase]);

    const filteredLocations = filter === 'all'
        ? locations
        : locations.filter(l => l.role === filter);

    const selectedPoint = locations.find(l => l.id === selectedId);

    const getIconForRole = (role: string) => {
        switch (role) {
            case 'petshop': return ShoppingBag;
            case 'boarding': return Home;
            case 'grooming': return Scissors;
            default: return MapIcon;
        }
    };

    const getColorForRole = (role: string) => {
        switch (role) {
            case 'petshop': return 'text-[#22eb7e] bg-[#22eb7e]/10';
            case 'boarding': return 'text-purple-500 bg-purple-500/10';
            case 'grooming': return 'text-pink-500 bg-pink-500/10';
            default: return 'text-blue-500 bg-blue-500/10';
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-100 relative">
            <div className="absolute inset-0 z-0">
                {!loading && (
                    <MapContainer
                        center={locations[0] ? [locations[0].latitude, locations[0].longitude] : [38.7223, -9.1393]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <UserLocationMarker />
                        {filteredLocations.map((loc) => (
                            <Marker
                                key={loc.id}
                                position={[loc.latitude, loc.longitude]}
                                eventHandlers={{
                                    click: () => setSelectedId(loc.id)
                                }}
                            >
                                <Popup>
                                    <div className="p-2">
                                        <p className="font-black text-slate-900 leading-tight mb-1">{loc.name}</p>
                                        <div className="flex items-center gap-1">
                                            <Star size={10} className="text-amber-400 fill-amber-400" />
                                            <span className="text-[10px] font-bold text-slate-600">{loc.rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>

            <div className="absolute top-0 left-0 right-0 p-6 z-20 space-y-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="size-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-600 active:scale-95 transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#22eb7e] transition-colors" size={18} />
                        <input
                            placeholder="Buscar estabelecimentos..."
                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white shadow-xl text-slate-900 outline-none font-bold text-sm placeholder:text-slate-300 focus:ring-4 focus:ring-[#22eb7e]/5 transition-all"
                        />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { label: 'Todos', value: 'all' },
                        { label: 'Hospedagem', value: 'boarding' },
                        { label: 'Banho & Tosa', value: 'grooming' },
                        { label: 'Lojas Pet', value: 'petshop' }
                    ].map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setFilter(cat.value)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-lg ${filter === cat.value ? 'bg-[#102217] text-white' : 'bg-white text-slate-400'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selectedPoint && (
                    <motion.div
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 200, opacity: 0 }}
                        className="absolute bottom-10 left-6 right-6 z-30"
                    >
                        <GlassCard className="!p-5 relative flex flex-col gap-4 border-white/40">
                            <button
                                onClick={() => setSelectedId(null)}
                                className="absolute top-4 right-4 text-slate-300 hover:text-slate-900 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className={`size-16 rounded-[1.5rem] ${getColorForRole(selectedPoint.role)} flex items-center justify-center shadow-inner`}>
                                    {React.createElement(getIconForRole(selectedPoint.role), { size: 30 })}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-slate-900 font-black tracking-tighter truncate leading-none mb-1">{selectedPoint.name}</h3>
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <div className="flex items-center gap-1">
                                            <Star size={12} className="text-amber-400 fill-amber-400" />
                                            <span className="text-slate-900 text-xs font-black">{selectedPoint.rating.toFixed(1)}</span>
                                        </div>
                                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">• {selectedPoint.role}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <MapIcon size={12} className="text-[#22eb7e]" />
                                        <p className="text-[10px] font-medium truncate">{selectedPoint.address}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Clock size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{selectedPoint.hours}</span>
                                </div>
                                <PremiumButton
                                    onClick={() => navigate(`/store/${selectedPoint.business_id}`)}
                                    className="!h-10 !px-6 !rounded-xl !text-[10px] !bg-[#22eb7e] !text-[#102217] font-black uppercase tracking-widest"
                                >
                                    Ver Perfil
                                </PremiumButton>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            <button className="absolute bottom-10 right-6 size-14 rounded-2xl bg-[#102217] shadow-2xl flex items-center justify-center text-[#22eb7e] z-20 active:scale-90 transition-all">
                <Navigation size={24} strokeWidth={2.5} />
            </button>
        </div>
    );
};

export default MapView;
