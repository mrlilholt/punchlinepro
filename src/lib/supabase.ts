import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabase_url = import.meta.env.VITE_SUPABASE_URL;
const supabase_anon_key = import.meta.env.VITE_SUPABASE_ANON_KEY;

const fallback_supabase_url = 'https://placeholder.supabase.co';
const fallback_supabase_key = 'placeholder-anon-key';

export const is_supabase_configured = Boolean(supabase_url && supabase_anon_key);

export const supabase_client: SupabaseClient = createClient(
  supabase_url ?? fallback_supabase_url,
  supabase_anon_key ?? fallback_supabase_key,
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  },
);
