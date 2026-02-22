import { useQuery } from '@tanstack/react-query';

import { fetch_daily_joke_service } from '../services/fetch_daily_joke_service';
import {
  get_local_release_slot_context,
} from '../../../shared/utils/date_helpers';

export function useDailyJokeQueryHook() {
  const releaseContext = get_local_release_slot_context();

  return useQuery({
    queryFn: fetch_daily_joke_service,
    queryKey: [
      'daily-joke',
      releaseContext.currentDateKey,
      releaseContext.currentSlot,
      releaseContext.fallbackDateKey,
      releaseContext.fallbackSlot,
    ],
    staleTime: 60_000,
  });
}
