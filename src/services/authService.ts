import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';

export const authService = {
    async guestSignIn() {
        // Mock a successful guest session
        return {
            data: {
                user: { id: 'guest-id', email: 'guest@dogdrive.com' },
                session: { user: { id: 'guest-id' } }
            },
            error: null
        };
    },

    async signUp(email: string, password: string, options: any) {
        return await supabase.auth.signUp({ email, password, options });
    },

    async signIn(email: string, password: string) {
        return await supabase.auth.signInWithPassword({ email, password });
    },

    async resetPassword(email: string, redirectTo: string) {
        return await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    },

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

    async updateProfile(userId: string, profile: Partial<UserProfile>) {
        return await supabase
            .from('profiles')
            .update(profile)
            .eq('id', userId);
    },

    onAuthStateChange(callback: (event: any, session: any) => void) {
        return supabase.auth.onAuthStateChange(callback);
    }
};
