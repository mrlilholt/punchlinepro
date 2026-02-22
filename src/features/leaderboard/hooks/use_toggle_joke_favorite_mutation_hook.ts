import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toggle_joke_favorite_service } from '../services/toggle_joke_favorite_service';

export function useToggleJokeFavoriteMutationHook(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      isFavorited,
      jokeId,
    }: {
      isFavorited: boolean;
      jokeId: string;
    }) => {
      if (!userId) {
        throw new Error('Missing user session.');
      }

      return toggle_joke_favorite_service({
        isFavorited,
        jokeId,
        userId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['joke-history', userId],
      });
    },
  });
}
