import { useQuery } from '@tanstack/react-query';

import { fetch_joke_punchline_service } from '../services/fetch_joke_punchline_service';

export function useJokePunchlineQueryHook(jokeId: string | null, enabled = true) {
  return useQuery({
    enabled: Boolean(jokeId) && enabled,
    queryFn: () => fetch_joke_punchline_service(jokeId as string),
    queryKey: ['joke-punchline', jokeId],
    staleTime: 60_000,
  });
}
