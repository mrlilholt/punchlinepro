import { supabase_client } from '../../../lib/supabase';
import type { UserGuessStatusRecord } from '../../../shared/types/database_types';

interface FetchGuessStatusParams {
  jokeId: string;
  userId: string;
}

export async function fetch_guess_status_service({
  jokeId,
  userId,
}: FetchGuessStatusParams): Promise<UserGuessStatusRecord | null> {
  const { data, error } = await supabase_client
    .from('guesses')
    .select(
      'id, joke_id, user_id, guess_text, is_correct, similarity_score, created_at',
    )
    .eq('user_id', userId)
    .eq('joke_id', jokeId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as UserGuessStatusRecord | null;
}
