import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

interface AuthContextType {
    user: any | null;
    profile: UserProfile | null;
    loading: boolean;
    isAuthenticated: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshProfile = async () => {
        if (user) {
            const userProfile = await authService.getProfile(user.id);
            setProfile(userProfile);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await authService.getSession();
                if (session) {
                    setUser(session.user);
                    let userProfile = await authService.getProfile(session.user.id);

                    // Fallback: If profile missing but session exists (e.g. trigger failed)
                    if (!userProfile && session.user) {
                        console.warn('Profile missing for user, creating fallback...');
                        const { data: newProfile } = await authService.supabase
                            .from('profiles')
                            .upsert({
                                id: session.user.id,
                                email: session.user.email,
                                role: session.user.user_metadata?.role || 'owner',
                                country: 'PT'
                            })
                            .select()
                            .single();
                        userProfile = newProfile;
                    }
                    setProfile(userProfile);
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
            console.log('Auth state change event:', event);
            if (session) {
                setUser(session.user);
                let userProfile = await authService.getProfile(session.user.id);
                if (!userProfile) {
                    const { data: newProfile } = await authService.supabase
                        .from('profiles')
                        .insert({
                            id: session.user.id,
                            email: session.user.email,
                            role: session.user.user_metadata?.role || 'owner',
                            country: 'PT'
                        })
                        .select()
                        .single();
                    userProfile = newProfile;
                }
                setProfile(userProfile);
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            isAuthenticated: !!user,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
