import { useMutation } from '@tanstack/react-query';

import { check_guess_similarity_service } from '../services/check_guess_similarity_service';

export function useSimilarityCheckMutationHook() {
  return useMutation({
    mutationFn: check_guess_similarity_service,
  });
}
