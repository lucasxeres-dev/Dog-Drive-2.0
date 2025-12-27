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

    async signIn(identifier: string, password: string) {
        // If it's not an email, try to find the email via username
        let email = identifier;
        if (!identifier.includes('@')) {
            const { data, error } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', identifier.toLowerCase())
                .single();

            if (data) {
                // Fetch the actual email from auth.users (requires a helper or being the same)
                // In this setup, we can try to sign in with a "fake" email format if we had it,
                // but better: retrieve email from our profiles if we stored it there.
                // Let's add email to profiles for easier lookup.
                const { data: userAuth } = await supabase.rpc('get_user_email_by_username', { username_p: identifier.toLowerCase() });
                if (userAuth) email = userAuth;
            }
        }
        return await supabase.auth.signInWithPassword({ email, password });
    },

    async resetPassword(email: string, redirectTo: string) {
        return await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    },

    async getSession() {
        return await supabase.auth.getSession();
    },

    async signOut() {
        localStorage.removeItem('dogdrive_guest');
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
