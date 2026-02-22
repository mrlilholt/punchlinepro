import { supabase_client } from '../../../lib/supabase';

export async function sign_in_google_service(): Promise<void> {
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : undefined;

  const { error } = await supabase_client.auth.signInWithOAuth({
    options: {
      redirectTo,
    },
    provider: 'google',
  });

  if (error) {
    throw error;
  }
}
