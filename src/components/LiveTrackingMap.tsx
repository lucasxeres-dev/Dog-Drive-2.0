import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSupabase } from '../hooks/useSupabase';
import { LocationUpdate } from '../types';

// Fix for default marker icons in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

interface LiveTrackingMapProps {
    bookingId: string;
    providerName: string;
    initialPosition?: [number, number];
}

// Component to auto-center map on new positions
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
    bookingId,
    providerName,
    initialPosition = [38.7223, -9.1393] // Lisbon default
}) => {
    const supabase = useSupabase();
    const [currentPosition, setCurrentPosition] = useState<[number, number]>(initialPosition);
    const [route, setRoute] = useState<[number, number][]>([initialPosition]);
    const [isLive, setIsLive] = useState(true);

    useEffect(() => {
        // Fetch existing location history
        const fetchHistory = async () => {
            const { data } = await supabase
                .from('location_updates')
                .select('*')
                .eq('booking_id', bookingId)
                .order('timestamp', { ascending: true });

            if (data && data.length > 0) {
                const points: [number, number][] = data.map((loc: LocationUpdate) => [
                    loc.latitude,
                    loc.longitude
                ]);
                setRoute(points);
                setCurrentPosition(points[points.length - 1]);
            }
        };

        fetchHistory();

        // Subscribe to real-time updates
        const channel = supabase
            .channel(`booking:${bookingId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'location_updates',
                    filter: `booking_id=eq.${bookingId}`
                },
                (payload) => {
                    const newLocation = payload.new as LocationUpdate;
                    const newPos: [number, number] = [newLocation.latitude, newLocation.longitude];

                    setCurrentPosition(newPos);
                    setRoute(prev => [...prev, newPos]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [bookingId, supabase]);

    return (
        <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-lg">
            <MapContainer
                center={currentPosition}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater center={currentPosition} />

                {/* Route polyline */}
                {route.length > 1 && (
                    <Polyline
                        positions={route}
                        pathOptions={{
                            color: '#22eb7e',
                            weight: 4,
                            opacity: 0.7
                        }}
                    />
                )}

                {/* Current position marker */}
                <Marker position={currentPosition}>
                    <Popup>
                        <div className="text-center font-bold">
                            <p className="text-sm text-slate-900">{providerName}</p>
                            <p className="text-xs text-[#22eb7e] uppercase tracking-wider">Localização Atual</p>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>

            {/* Live indicator */}
            {isLive && (
                <div className="absolute top-4 right-4 z-[1000] bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-600">AO VIVO</span>
                </div>
            )}
        </div>
    );
};

export default LiveTrackingMap;
