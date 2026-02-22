import { supabase_client } from '../../lib/supabase';

export function useSupabaseClientHook() {
  return supabase_client;
}
