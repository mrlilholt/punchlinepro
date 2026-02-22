import { useQuery } from '@tanstack/react-query';

import { fetch_guess_status_service } from '../services/fetch_guess_status_service';

export function useUserGuessStatusQueryHook(
  userId: string | null,
  jokeId: string | null,
) {
  return useQuery({
    enabled: Boolean(userId && jokeId),
    queryFn: () =>
      fetch_guess_status_service({
        jokeId: jokeId as string,
        userId: userId as string,
      }),
    queryKey: ['user-guess-status', userId, jokeId],
  });
}
