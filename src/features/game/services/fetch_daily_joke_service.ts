import type { DailyJokeRecord } from '../../../shared/types/database_types';
import { supabase_client } from '../../../lib/supabase';
import {
  type LocalReleaseCandidate,
  type ReleaseSlotType,
  get_recent_local_release_candidates,
} from '../../../shared/utils/date_helpers';
import { parse_question_answer_joke_text } from '../../../shared/utils/parse_question_answer_joke_text';

const MAX_PREVIOUS_UNANSWERED_RELEASES = 3;

interface GuessJokeIdRow {
  joke_id: string;
}

function is_defined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

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

function build_release_key_from_candidate(candidate: LocalReleaseCandidate): string {
  return build_release_key(candidate.dateKey, candidate.slot);
}

export async function fetch_daily_joke_service(
  userId: string | null,
): Promise<DailyJokeRecord | null> {
  const releaseCandidates = get_recent_local_release_candidates(MAX_PREVIOUS_UNANSWERED_RELEASES);
  const candidateReleaseKeys = releaseCandidates.map(build_release_key_from_candidate);
  const candidateDateKeys = [...new Set(releaseCandidates.map((candidate) => candidate.dateKey))];

  const { data, error } = await supabase_client
    .from('daily_jokes')
    .select('id, joke_date, release_slot, setup')
    .in('joke_date', candidateDateKeys)
    .in('release_slot', ['AM', 'PM']);

  if (error) {
    throw error;
  }

  const candidateRows = ((data ?? []) as DailyJokeRecord[]).filter(
    (jokeRow): jokeRow is DailyJokeRecord & { release_slot: ReleaseSlotType } =>
      jokeRow.release_slot === 'AM' || jokeRow.release_slot === 'PM',
  );

  const orderedCandidateRows =
    candidateReleaseKeys
      .map((releaseKey) =>
        candidateRows.find(
          (jokeRow) => build_release_key(jokeRow.joke_date, jokeRow.release_slot) === releaseKey,
        ),
      )
      .filter(is_defined);

  const parsedCandidateRows = orderedCandidateRows.flatMap((candidateRow) => {
    const parsed_joke = parse_question_answer_joke_text(candidateRow.setup);

    if (!parsed_joke.is_question_answer_based || !parsed_joke.question_setup) {
      return [];
    }

    return [
      {
        ...candidateRow,
        setup: parsed_joke.question_setup,
      },
    ];
  });

  if (parsedCandidateRows.length && userId) {
    const { data: userGuessRows, error: userGuessRowsError } = await supabase_client
      .from('guesses')
      .select('joke_id')
      .eq('user_id', userId)
      .in(
        'joke_id',
        parsedCandidateRows.map((jokeRow) => jokeRow.id),
      );

    if (userGuessRowsError) {
      throw userGuessRowsError;
    }

    const answeredJokeIds = new Set<string>(
      ((userGuessRows ?? []) as GuessJokeIdRow[]).map((guessRow) => guessRow.joke_id),
    );

    const unansweredCandidateRow = parsedCandidateRows.find(
      (candidateRow) => !answeredJokeIds.has(candidateRow.id),
    );

    if (unansweredCandidateRow) {
      return unansweredCandidateRow;
    }
  }

  const selectedRow = parsedCandidateRows[0] ?? null;

  if (!selectedRow) {
    return build_local_fallback_joke(
      releaseCandidates[0]?.dateKey ?? new Date().toISOString().slice(0, 10),
      releaseCandidates[0]?.slot ?? 'AM',
    );
  }

  return selectedRow;
}
