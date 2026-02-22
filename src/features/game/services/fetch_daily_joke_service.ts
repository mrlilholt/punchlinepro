import type { DailyJokeRecord } from '../../../shared/types/database_types';
import { supabase_client } from '../../../lib/supabase';
import {
  type ReleaseSlotType,
  get_local_release_slot_context,
} from '../../../shared/utils/date_helpers';
import { parse_question_answer_joke_text } from '../../../shared/utils/parse_question_answer_joke_text';

function build_local_fallback_joke(
  dateKey: string,
  slot: ReleaseSlotType,
): DailyJokeRecord {
  return {
    id: '00000000-0000-0000-0000-000000000000',
    is_fallback: true,
    joke_date: dateKey,
    release_slot: slot,
    setup: "Why don't skeletons fight each other?",
  };
}

function build_release_key(dateKey: string, slot: ReleaseSlotType): string {
  return `${dateKey}:${slot}`;
}

export async function fetch_daily_joke_service(): Promise<DailyJokeRecord | null> {
  const releaseContext = get_local_release_slot_context();
  const candidateReleaseKeys = [
    build_release_key(releaseContext.currentDateKey, releaseContext.currentSlot),
    build_release_key(releaseContext.fallbackDateKey, releaseContext.fallbackSlot),
  ];

  const { data, error } = await supabase_client
    .from('daily_jokes')
    .select('id, joke_date, release_slot, setup')
    .in('joke_date', [releaseContext.currentDateKey, releaseContext.fallbackDateKey])
    .in('release_slot', ['AM', 'PM']);

  if (error) {
    throw error;
  }

  const candidateRows = ((data ?? []) as DailyJokeRecord[]).filter(
    (jokeRow): jokeRow is DailyJokeRecord & { release_slot: ReleaseSlotType } =>
      jokeRow.release_slot === 'AM' || jokeRow.release_slot === 'PM',
  );

  const selectedRow =
    candidateReleaseKeys
      .map((releaseKey) =>
        candidateRows.find(
          (jokeRow) => build_release_key(jokeRow.joke_date, jokeRow.release_slot) === releaseKey,
        ),
      )
      .find(Boolean) ?? null;

  if (!selectedRow) {
    return build_local_fallback_joke(
      releaseContext.currentDateKey,
      releaseContext.currentSlot,
    );
  }

  const parsed_joke = parse_question_answer_joke_text(selectedRow.setup);

  if (!parsed_joke.is_question_answer_based || !parsed_joke.question_setup) {
    return build_local_fallback_joke(
      releaseContext.currentDateKey,
      releaseContext.currentSlot,
    );
  }

  return {
    ...selectedRow,
    setup: parsed_joke.question_setup,
  };
}
