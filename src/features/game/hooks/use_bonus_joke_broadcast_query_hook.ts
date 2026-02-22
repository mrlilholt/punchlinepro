import { useQuery } from '@tanstack/react-query';

import { fetch_bonus_joke_broadcast_service } from '../services/fetch_bonus_joke_broadcast_service';

export function useBonusJokeBroadcastQueryHook() {
  return useQuery({
    queryFn: fetch_bonus_joke_broadcast_service,
    queryKey: ['bonus-joke-broadcast'],
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
}
