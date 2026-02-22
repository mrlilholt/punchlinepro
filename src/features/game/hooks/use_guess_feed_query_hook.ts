import { useQuery } from '@tanstack/react-query';

import { fetch_guess_feed_service } from '../services/fetch_guess_feed_service';

export function useGuessFeedQueryHook(jokeId: string, enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => fetch_guess_feed_service(jokeId),
    queryKey: ['guess-feed', jokeId],
    refetchInterval: 5000,
  });
}
