import { useState, useEffect, useRef } from 'react';
import { useSupabase } from './useSupabase';

export const useGpsTracker = (isOnline: boolean) => {
    const supabase = useSupabase();
    const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
    const [error, setError] = useState<string | null>(null);
    const watchId = useRef<number | null>(null);

    useEffect(() => {
        if (!isOnline) {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
            return;
        }

        if (!navigator.geolocation) {
            setError('Geolocalização não suportada');
            return;
        }

        watchId.current = navigator.geolocation.watchPosition(
            async (position) => {
                setLocation(position.coords);

                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // 1. Update business profile (for MapView)
                await supabase
                    .from('business_profiles')
                    .update({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        is_online: true
                    })
                    .eq('id', user.id);

                // 2. Log to location_updates (for history/tracking)
                await supabase
                    .from('location_updates')
                    .insert({
                        provider_id: user.id,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
            },
            (err) => {
                setError(err.message);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 5000
            }
        );

        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
            }
        };
    }, [isOnline, supabase]);

    return { location, error };
};
