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
    ShoppingBag,
    X
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

interface ServicePoint {
    id: string;
    name: string;
    business_id: string;
    role: string;
    latitude: number;
    longitude: number;
    rating: number;
    address: string;
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
    const [locations, setLocations] = useState<ServicePoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                // Fetch from business_locations joined with business_profiles
                const { data, error } = await supabase
                    .from('business_locations')
                    .select('*, business_profiles(id, company_name, service_type)')
                    .eq('is_active', true);

                if (error) throw error;

                const mapped = (data || [])
                    .filter((l: any) => l.latitude && l.longitude)
                    .map((l: any) => ({
                        id: l.id,
                        business_id: l.business_id,
                        name: l.name || l.business_profiles?.company_name || 'Local',
                        role: l.business_profiles?.service_type || 'grooming',
                        latitude: parseFloat(l.latitude),
                        longitude: parseFloat(l.longitude),
                        rating: 4.8,
                        address: l.address
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
                                    <div className="text-center">
                                        <p className="font-bold text-sm">{loc.name}</p>
                                        <p className="text-[10px] text-slate-500 uppercase">{loc.role}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>

            <div className="absolute top-0 left-0 right-0 p-6 z-20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="size-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-slate-600"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            placeholder="Buscar no Dog Drive..."
                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white shadow-lg text-slate-900 outline-none font-bold"
                        />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4">
                    {[
                        { label: 'Todos', value: 'all' },
                        { label: 'Passeios', value: 'walker' },
                        { label: 'Lojas Pet', value: 'petshop' },
                        { label: 'Hospedagem', value: 'boarding' },
                        { label: 'Banho & Tosa', value: 'grooming' }
                    ].map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setFilter(cat.value)}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === cat.value ? 'bg-[#22eb7e] text-[#102217]' : 'bg-white text-slate-600'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selectedPoint && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-10 left-6 right-6 z-30"
                    >
                        <div className="bg-white rounded-[2rem] p-5 flex items-center gap-4 shadow-2xl border border-slate-100 relative">
                            <div className={`size-16 rounded-[1.5rem] ${getColorForRole(selectedPoint.role)} flex items-center justify-center text-white shadow-lg`}>
                                {React.createElement(getIconForRole(selectedPoint.role), { size: 32 })}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-slate-900 font-black tracking-tight">{selectedPoint.name}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Star size={12} className="text-amber-400 fill-amber-400" />
                                    <span className="text-slate-600 text-xs font-bold">{selectedPoint.rating}</span>
                                    <span className="text-slate-400 text-[10px]">• {selectedPoint.address.split(',')[0]}</span>
                                </div>
                                <button
                                    onClick={() => navigate(`/store/${selectedPoint.business_id}`)}
                                    className="mt-3 text-[#22eb7e] text-[10px] font-black uppercase tracking-widest"
                                >
                                    Ver Perfil Completo
                                </button>
                            </div>
                            <button
                                onClick={() => setSelectedId(null)}
                                className="absolute top-4 right-4 text-slate-300"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button className="absolute bottom-10 right-6 size-14 rounded-[1.5rem] bg-[#22eb7e] shadow-2xl flex items-center justify-center text-[#102217] z-20">
                <Navigation size={24} fill="currentColor" />
            </button>
        </div>
    );
};

export default MapView;
