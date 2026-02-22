import { supabase_client } from '../../../lib/supabase';
import type { JokePunchlineRecord } from '../../../shared/types/database_types';

export async function fetch_joke_punchline_service(
  jokeId: string,
): Promise<JokePunchlineRecord | null> {
  const { data, error } = await supabase_client
    .from('daily_jokes')
    .select('id, punchline')
    .eq('id', jokeId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as JokePunchlineRecord | null) ?? null;
}
