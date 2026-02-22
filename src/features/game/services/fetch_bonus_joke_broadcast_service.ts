import { supabase_client } from '../../../lib/supabase';
import type { BonusJokeRecord } from '../../../shared/types/database_types';

export async function fetch_bonus_joke_broadcast_service(): Promise<BonusJokeRecord[]> {
  const { data, error } = await supabase_client
    .from('bonus_jokes')
    .select('id, user_id, setup, punchline, created_at, profiles(display_name)')
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) {
    throw error;
  }

  return (data ?? []) as BonusJokeRecord[];
}
