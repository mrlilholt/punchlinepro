import { useMutation, useQueryClient } from '@tanstack/react-query';

import { submit_guess_service } from '../services/submit_guess_service';

export function useSubmitGuessMutationHook(
  userId: string | null,
  jokeId: string | null,
) {
  const query_client = useQueryClient();

  return useMutation({
    mutationFn: (guessText: string) => {
      if (!userId || !jokeId) {
        throw new Error('Missing user session or active joke.');
      }

      return submit_guess_service({
        guessText,
        jokeId,
        userId,
      });
    },
    onSuccess: async () => {
      await query_client.invalidateQueries({
        queryKey: ['guess-feed', jokeId],
      });
      await query_client.invalidateQueries({
        queryKey: ['leaderboard-top-five'],
      });
      await query_client.invalidateQueries({
        queryKey: ['user-guess-status', userId, jokeId],
      });
      await query_client.invalidateQueries({
        queryKey: ['joke-history', userId],
      });
    },
  });
}
