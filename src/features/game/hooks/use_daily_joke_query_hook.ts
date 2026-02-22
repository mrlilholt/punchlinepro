import { useQuery } from '@tanstack/react-query';

import { get_local_release_slot_context } from '../../../shared/utils/date_helpers';
import { fetch_daily_joke_service } from '../services/fetch_daily_joke_service';

export function useDailyJokeQueryHook(userId: string | null) {
  const releaseContext = get_local_release_slot_context();

  return useQuery({
    queryFn: () => fetch_daily_joke_service(userId),
    queryKey: [
      'daily-joke',
      userId,
      releaseContext.currentDateKey,
      releaseContext.currentSlot,
      releaseContext.fallbackDateKey,
      releaseContext.fallbackSlot,
    ],
    staleTime: 60_000,
  });
}
