import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

export const useAuth = () => {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await authService.getSession();
                if (session) {
                    setUser(session.user);
                    const userProfile = await authService.getProfile(session.user.id);
                    setProfile(userProfile);
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        let subscription: any;

        try {
            const { data } = authService.onAuthStateChange(async (_event, session) => {
                if (session) {
                    setUser(session.user);
                    const userProfile = await authService.getProfile(session.user.id);
                    setProfile(userProfile);
                } else {
                    setUser(null);
                    setProfile(null);
                }
                setLoading(false);
            });
            subscription = data.subscription;
        } catch (err) {
            console.error('Auth state change listener error:', err);
            setLoading(false);
        }

        return () => subscription?.unsubscribe();
    }, []);

    return { user, profile, loading, isAuthenticated: !!user };
};
