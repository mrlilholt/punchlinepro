import { supabase_client } from '../../../lib/supabase';
import type { LeaderboardRecord } from '../../../shared/types/database_types';

export async function fetch_leaderboard_service(): Promise<LeaderboardRecord[]> {
  const { data, error } = await supabase_client
    .from('profiles')
    .select('id, display_name, total_score')
    .order('total_score', { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  return (data ?? []) as LeaderboardRecord[];
}
