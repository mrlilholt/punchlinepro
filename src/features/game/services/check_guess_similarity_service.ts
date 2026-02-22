import { supabase_client } from '../../../lib/supabase';
import type { GuessSimilarityResult } from '../../../shared/types/database_types';

interface CheckGuessSimilarityParams {
  jokeId: string;
  userGuess: string;
}

interface CheckGuessResponse {
  is_correct: boolean;
  score: number;
}

export async function check_guess_similarity_service({
  jokeId,
  userGuess,
}: CheckGuessSimilarityParams): Promise<GuessSimilarityResult> {
  const { data, error } = await supabase_client.rpc('check_guess', {
    joke_id: jokeId,
    user_guess: userGuess,
  });

  if (error) {
    throw error;
  }

  const check_response = Array.isArray(data)
    ? (data[0] as CheckGuessResponse | undefined)
    : (data as CheckGuessResponse | null);

  const score = Number(check_response?.score ?? 0);
  const is_correct = Boolean(check_response?.is_correct) || score >= 0.8;

  return {
    is_correct,
    score,
  };
}
