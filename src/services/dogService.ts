import { supabase } from '../lib/supabaseClient';

export const dogService = {
    async countDogsByOwner(ownerId: string): Promise<number> {
        const { count, error } = await supabase
            .from('dogs')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', ownerId);

        if (error) {
            console.error('Error counting dogs:', error);
            return 0;
        }

        return count || 0;
    }
};
