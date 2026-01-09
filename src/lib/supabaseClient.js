import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://auth.ansimssi.ai';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
