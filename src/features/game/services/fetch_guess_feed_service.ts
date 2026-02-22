import { supabase_client } from '../../../lib/supabase';
import type { GuessFeedRecord } from '../../../shared/types/database_types';

export async function fetch_guess_feed_service(
  jokeId: string,
): Promise<GuessFeedRecord[]> {
  const { data, error } = await supabase_client
    .from('guesses')
    .select(
      'id, joke_id, user_id, guess_text, is_correct, similarity_score, created_at, profiles(display_name)',
    )
    .eq('joke_id', jokeId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as GuessFeedRecord[];
}
