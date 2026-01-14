import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://ygpwrtyswyinbzgtfssg.supabase.co';
const supabaseAnonKey = 'sb_publishable_JZjK4A1PsqUA0FX7JT8Lzw_8RF_97k3';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export interface DashboardEvent {
  id?: string;
  user_id?: string;
  event_type: string;
  payload: any;
  created_at?: string;
}

export const logDashboardEvent = async (eventType: string, payload: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('[Dashboard Event Logged (Local)]', eventType, payload);
      return;
    }

    const { error } = await supabase.from('dashboard_events').insert({
      user_id: user.id,
      event_type: eventType,
      payload
    });

    if (error) throw error;
  } catch (error) {
    console.warn('Failed to log dashboard event:', error);
  }
};

export const getDashboardHistory = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('dashboard_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data as DashboardEvent[];
  } catch (error) {
    console.warn('Failed to fetch history:', error);
    return [];
  }
};