import { useQuery } from '@tanstack/react-query';

import { fetch_leaderboard_service } from '../services/fetch_leaderboard_service';

export function useLeaderboardQueryHook() {
  return useQuery({
    queryFn: fetch_leaderboard_service,
    queryKey: ['leaderboard-top-five'],
    staleTime: 90_000,
  });
}
