import { supabase_client } from '../../../lib/supabase';

export async function sign_in_google_service(): Promise<void> {
  const { error } = await supabase_client.auth.signInWithOAuth({ provider: 'google' });

  if (error) {
    throw error;
  }
}
