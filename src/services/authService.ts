import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';

export const authService = {
    async getSession() {
        return await supabase.auth.getSession();
    },

    async signOut() {
        return await supabase.auth.signOut();
    },

    async getProfile(userId: string): Promise<UserProfile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        return data;
    },

    onAuthStateChange(callback: (event: any, session: any) => void) {
        return supabase.auth.onAuthStateChange(callback);
    }
};
