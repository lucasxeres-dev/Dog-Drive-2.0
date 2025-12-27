import { useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Custom hook for accessing Supabase client
 * Provides centralized, type-safe access to Supabase
 * 
 * @returns Supabase client instance
 */
export const useSupabase = () => {
    return supabase;
};

/**
 * Hook for common Supabase operations with error handling
 */
export const useSupabaseQuery = () => {
    const fetchWithErrorHandling = useCallback(async <T,>(
        queryFn: () => Promise<{ data: T | null; error: any }>
    ): Promise<T | null> => {
        try {
            const { data, error } = await queryFn();
            if (error) {
                console.error('Supabase query error:', error);
                return null;
            }
            return data;
        } catch (err) {
            console.error('Unexpected error:', err);
            return null;
        }
    }, []);

    return { fetchWithErrorHandling };
};
