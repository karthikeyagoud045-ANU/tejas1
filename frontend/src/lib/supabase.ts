// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygpwrtyswyinbzgtfssg.supabase.co';
const supabaseAnonKey = 'sb_publishable_JZjK4A1PsqUA0FX7JT8Lzw_8RF_97k3';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

export default supabase;
