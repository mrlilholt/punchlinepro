import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toggle_joke_like_service } from '../services/toggle_joke_like_service';

export function useToggleJokeLikeMutationHook(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ isLiked, jokeId }: { isLiked: boolean; jokeId: string }) => {
      if (!userId) {
        throw new Error('Missing user session.');
      }

      return toggle_joke_like_service({
        isLiked,
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
