import { supabase_client } from '../../../lib/supabase';
import type {
  GuessSimilarityResult,
  GuessSubmissionResult,
} from '../../../shared/types/database_types';

import { check_guess_similarity_service } from './check_guess_similarity_service';

interface SubmitGuessParams {
  guessText: string;
  jokeId: string;
  userId: string;
}

function build_fuzzy_feedback(
  score: number,
  isCorrect: boolean,
): string | null {
  if (isCorrect) {
    return 'Perfect delivery. You unlocked the room.';
  }

  if (score > 0.6 && score < 0.8) {
    return 'So close! Try again?';
  }

  return 'Not quite there yet.';
}

export async function submit_guess_service({
  guessText,
  jokeId,
  userId,
}: SubmitGuessParams): Promise<GuessSubmissionResult> {
  const trimmed_guess = guessText.trim();

  if (!trimmed_guess) {
    throw new Error('Please enter a guess first.');
  }

  const similarity_result: GuessSimilarityResult = await check_guess_similarity_service(
    {
      jokeId,
      userGuess: trimmed_guess,
    },
  );

  const { error } = await supabase_client.from('guesses').insert({
    guess_text: trimmed_guess,
    is_correct: similarity_result.is_correct,
    joke_id: jokeId,
    similarity_score: similarity_result.score,
    user_id: userId,
  });

  if (error) {
    throw error;
  }

  return {
    fuzzyFeedback: build_fuzzy_feedback(
      similarity_result.score,
      similarity_result.is_correct,
    ),
    isCorrect: similarity_result.is_correct,
    score: similarity_result.score,
  };
}
