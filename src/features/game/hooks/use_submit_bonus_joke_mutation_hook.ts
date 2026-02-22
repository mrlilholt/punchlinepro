import { useMutation, useQueryClient } from '@tanstack/react-query';

import { submit_bonus_joke_service } from '../services/submit_bonus_joke_service';

export function useSubmitBonusJokeMutationHook(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      punchlineText,
      setupText,
    }: {
      punchlineText: string;
      setupText: string;
    }) => {
      if (!userId) {
        throw new Error('Missing user session.');
      }

      return submit_bonus_joke_service({
        punchlineText,
        setupText,
        userId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['bonus-joke-broadcast'],
      });
    },
  });
}
