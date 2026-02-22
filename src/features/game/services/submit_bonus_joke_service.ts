import { supabase_client } from '../../../lib/supabase';

interface SubmitBonusJokeParams {
  punchlineText: string;
  setupText: string;
  userId: string;
}

export async function submit_bonus_joke_service({
  punchlineText,
  setupText,
  userId,
}: SubmitBonusJokeParams): Promise<void> {
  const trimmed_setup = setupText.trim();
  const trimmed_punchline = punchlineText.trim();

  if (!trimmed_setup) {
    throw new Error('Enter a bonus joke setup.');
  }

  if (!trimmed_punchline) {
    throw new Error('Enter the bonus punchline.');
  }

  const { error } = await supabase_client.from('bonus_jokes').insert({
    punchline: trimmed_punchline,
    setup: trimmed_setup,
    user_id: userId,
  });

  if (error) {
    throw error;
  }
}
