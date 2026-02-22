import { useQuery } from '@tanstack/react-query';

import { fetch_joke_history_service } from '../services/fetch_joke_history_service';

export function useJokeHistoryQueryHook(userId: string | null) {
  return useQuery({
    enabled: Boolean(userId),
    queryFn: () => fetch_joke_history_service(userId as string),
    queryKey: ['joke-history', userId],
    staleTime: 30_000,
  });
}
