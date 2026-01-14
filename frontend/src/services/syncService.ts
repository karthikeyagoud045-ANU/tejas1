import { supabase } from './supabaseClient';

// Type definitions for sync service
export type EventType = 'meal' | 'exercise' | 'water' | 'report' | 'medication';

export interface HealthEvent {
    id?: string;
    user_id?: string;
    event_type: EventType;
    data: Record<string, unknown>;
    created_at?: string;
}

export interface UserProfile {
    id: string;
    name?: string;
    conditions?: string[];
    goals?: string[];
    onboarding_done?: boolean;
    created_at?: string;
    updated_at?: string;
}

export const syncService = {
    /**
     * Log any health event (meal, exercise, water, report)
     * Falls back to local storage if user is not logged in
     */
    async logEvent(type: EventType, data: Record<string, unknown>): Promise<boolean> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log('No user logged in, saving locally');
                return false;
            }
            const { error } = await supabase.from('health_events').insert({
                user_id: user.id,
                event_type: type,
                data: data
            });
            if (error) {
                console.error('Sync error:', error.message);
                return false;
            }

            console.log('✅ Event synced:', type);
            return true;
        } catch (err) {
            console.error('Sync failed:', err);
            return false;
        }
    },

    /**
     * Get all events for timeline display
     */
    async getEvents(limit: number = 50): Promise<HealthEvent[]> {
        try {
            const { data, error } = await supabase
                .from('health_events')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Failed to get events:', error.message);
                return [];
            }
            return (data as HealthEvent[]) || [];
        } catch (err) {
            console.error('Failed to get events:', err);
            return [];
        }
    },

    /**
     * Get user profile from database
     */
    async getProfile(): Promise<UserProfile | null> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Failed to get profile:', error.message);
                return null;
            }
            return data as UserProfile;
        } catch (err) {
            console.error('Failed to get profile:', err);
            return null;
        }
    },

    /**
     * Save or update user profile
     */
    async saveProfile(updates: Partial<UserProfile>): Promise<boolean> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    ...updates,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error('Failed to save profile:', error.message);
                return false;
            }
            return true;
        } catch (err) {
            console.error('Failed to save profile:', err);
            return false;
        }
    }
};