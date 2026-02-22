import { useEffect, useState } from 'react';

import {
  format_countdown_clock,
  format_local_time_label,
  get_local_release_slot_context,
  get_release_slot_label,
} from '../../../shared/utils/date_helpers';

interface ReleaseCountdownState {
  countdownLabel: string;
  currentSlotLabel: string;
  nextReleaseLabel: string;
}

function build_release_countdown_state(): ReleaseCountdownState {
  const releaseContext = get_local_release_slot_context();
  const countdownMilliseconds =
    releaseContext.nextReleaseDate.getTime() - Date.now();

  return {
    countdownLabel: format_countdown_clock(countdownMilliseconds),
    currentSlotLabel: get_release_slot_label(releaseContext.currentSlot),
    nextReleaseLabel: format_local_time_label(releaseContext.nextReleaseDate),
  };
}

export function useReleaseCountdownHook(): ReleaseCountdownState {
  const [countdownState, setCountdownState] = useState<ReleaseCountdownState>(
    build_release_countdown_state(),
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCountdownState(build_release_countdown_state());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return countdownState;
}
