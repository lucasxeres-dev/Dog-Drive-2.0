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
    Footprints,
    Home,
    Scissors,
    ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabase } from '../hooks/useSupabase';
import { Skeleton } from '../components/UIComponents';

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

interface Provider {
    id: string;
    name: string;
    role: string;
    latitude: number;
    longitude: number;
    rating: number;
}

// Component to get user location
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
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const { data } = await supabase
                    .from('business_profiles')
                    .select('id, business_name, service_type, latitude, longitude');

                const mapped = (data || [])
                    .filter((p: any) => p.latitude && p.longitude) // Only show providers with coordinates
                    .map((p: any) => ({
                        id: p.id,
                        name: p.business_name || 'Provedor',
                        role: p.service_type || 'walker',
                        latitude: parseFloat(p.latitude),
                        longitude: parseFloat(p.longitude),
                        rating: 4.7 // Mock for now
                    }));

                setProviders(mapped);
            } catch (err) {
                console.error('Error fetching providers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProviders();
    }, [supabase]);

    const filteredProviders = filter === 'all'
        ? providers
        : providers.filter(p => p.role === filter);

    const selectedProvider = providers.find(p => p.id === selectedId);

    const getIconForRole = (role: string) => {
        switch (role) {
            case 'petshop': return ShoppingBag;
            case 'boarding': return Home;
            case 'grooming': return Scissors;
            default: return Footprints;
        }
    };

    const getColorForRole = (role: string) => {
        switch (role) {
            case 'petshop': return 'bg-[#22eb7e]';
            case 'boarding': return 'bg-purple-500';
            case 'grooming': return 'bg-pink-500';
            default: return 'bg-blue-500';
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-900 relative">
            {/* Map Container */}
            <div className="absolute inset-0 z-0">
                {!loading && (
                    <MapContainer
                        center={providers[0] ? [providers[0].latitude, providers[0].longitude] : [38.7223, -9.1393]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <UserLocationMarker />

                        {filteredProviders.map((provider) => (
                            <Marker
                                key={provider.id}
                                position={[provider.latitude, provider.longitude]}
                                eventHandlers={{
                                    click: () => setSelectedId(provider.id)
                                }}
                            >
                                <Popup>
                                    <div className="text-center">
                                        <p className="font-bold text-sm">{provider.name}</p>
                                        <p className="text-xs text-slate-500 uppercase">{provider.role}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>

            {/* Header / Search */}
            <div className="absolute top-0 left-0 right-0 p-6 z-20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="size-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-slate-600 active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            placeholder="Buscar serviços próximos..."
                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white shadow-lg text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#22eb7e]/50 transition-all font-bold"
                        />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4">
                    {[
                        { label: 'Todos', value: 'all' },
                        { label: 'Passeios', value: 'walker' },
                        { label: 'Lojas', value: 'petshop' },
                        { label: 'Hospedagem', value: 'boarding' },
                        { label: 'Grooming', value: 'grooming' }
                    ].map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setFilter(cat.value)}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === cat.value ? 'bg-[#22eb7e] text-[#102217] shadow-lg shadow-[#22eb7e]/30' : 'bg-white text-slate-600 shadow-md'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Floating Selection Card */}
            <AnimatePresence>
                {selectedProvider && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-10 left-6 right-6 z-30"
                    >
                        <div className="bg-white rounded-[2rem] p-5 flex items-center gap-4 shadow-2xl border border-slate-100">
                            <div className={`size-16 rounded-[1.5rem] ${getColorForRole(selectedProvider.role)} flex items-center justify-center text-white shadow-lg`}>
                                {React.createElement(getIconForRole(selectedProvider.role), { size: 32 })}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-slate-900 font-black tracking-tight">{selectedProvider.name}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Star size={12} className="text-amber-400 fill-amber-400" />
                                    <span className="text-slate-600 text-xs font-bold">{selectedProvider.rating}</span>
                                    <span className="text-slate-400 text-[10px]">• Próximo</span>
                                </div>
                                <button
                                    onClick={() => navigate('/services')}
                                    className="mt-3 text-[#22eb7e] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                                >
                                    Agendar Agora <ChevronLeft size={10} className="rotate-180" />
                                </button>
                            </div>
                            <button
                                onClick={() => setSelectedId(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                            >
                                <ChevronLeft size={20} className="rotate-90" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* GPS FAB */}
            <button className="absolute bottom-10 right-6 size-14 rounded-[1.5rem] bg-[#22eb7e] shadow-2xl shadow-[#22eb7e]/40 flex items-center justify-center text-[#102217] z-20 active:scale-95 transition-transform">
                <Navigation size={24} fill="currentColor" />
            </button>
        </div>
    );
};

export default MapView;
