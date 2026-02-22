import { supabase_client } from '../../../lib/supabase';
import type {
  JokeHistoryBaseRecord,
  JokeHistoryListItem,
} from '../../../shared/types/database_types';
import type { ReleaseSlotType } from '../../../shared/utils/date_helpers';

interface JokeLikeRow {
  joke_id: string;
  user_id: string;
}

interface JokeFavoriteRow {
  joke_id: string;
}

interface UserGuessHistoryRow {
  created_at: string;
  joke_id: string;
}

function coerce_release_slot(slot: unknown): ReleaseSlotType {
  return slot === 'PM' ? 'PM' : 'AM';
}

export async function fetch_joke_history_service(
  userId: string,
): Promise<JokeHistoryListItem[]> {
  const { data: userGuessRows, error: userGuessRowsError } = await supabase_client
    .from('guesses')
    .select('joke_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(120);

  if (userGuessRowsError) {
    throw userGuessRowsError;
  }

  const answeredJokeIds: string[] = [];
  const seenJokeIds = new Set<string>();

  ((userGuessRows ?? []) as UserGuessHistoryRow[]).forEach((guessRow) => {
    if (!guessRow.joke_id || seenJokeIds.has(guessRow.joke_id)) {
      return;
    }

    seenJokeIds.add(guessRow.joke_id);
    answeredJokeIds.push(guessRow.joke_id);
  });

  if (!answeredJokeIds.length) {
    return [];
  }

  const { data: jokeRows, error: jokeRowsError } = await supabase_client
    .from('daily_jokes')
    .select('id, joke_date, release_slot, setup, punchline, source_api_id')
    .in('id', answeredJokeIds)
    .order('joke_date', { ascending: false })
    .order('release_slot', { ascending: false })
    .limit(40);

  if (jokeRowsError) {
    throw jokeRowsError;
  }

  const normalizedJokeRows: JokeHistoryBaseRecord[] = ((jokeRows ?? []) as Array<
    Partial<JokeHistoryBaseRecord>
  >).map((jokeRow) => ({
    id: String(jokeRow.id),
    joke_date: String(jokeRow.joke_date),
    punchline: String(jokeRow.punchline ?? ''),
    release_slot: coerce_release_slot(jokeRow.release_slot),
    setup: String(jokeRow.setup ?? ''),
    source_api_id:
      typeof jokeRow.source_api_id === 'string' ? jokeRow.source_api_id : null,
  }));

  if (!normalizedJokeRows.length) {
    return [];
  }

  const jokeIds = normalizedJokeRows.map((jokeRow) => jokeRow.id);

  const [likeRowsResult, favoriteRowsResult] = await Promise.all([
    supabase_client
      .from('joke_likes')
      .select('joke_id, user_id')
      .in('joke_id', jokeIds),
    supabase_client
      .from('joke_favorites')
      .select('joke_id')
      .eq('user_id', userId)
      .in('joke_id', jokeIds),
  ]);

  if (likeRowsResult.error) {
    throw likeRowsResult.error;
  }

  if (favoriteRowsResult.error) {
    throw favoriteRowsResult.error;
  }

  const likeCountByJokeId = new Map<string, number>();
  const userLikedJokeIds = new Set<string>();

  ((likeRowsResult.data ?? []) as JokeLikeRow[]).forEach((likeRow) => {
    likeCountByJokeId.set(
      likeRow.joke_id,
      (likeCountByJokeId.get(likeRow.joke_id) ?? 0) + 1,
    );

    if (likeRow.user_id === userId) {
      userLikedJokeIds.add(likeRow.joke_id);
    }
  });

  const userFavoritedJokeIds = new Set<string>(
    ((favoriteRowsResult.data ?? []) as JokeFavoriteRow[]).map(
      (favoriteRow) => favoriteRow.joke_id,
    ),
  );

  return normalizedJokeRows.map((jokeRow) => ({
    ...jokeRow,
    is_favorited: userFavoritedJokeIds.has(jokeRow.id),
    is_liked: userLikedJokeIds.has(jokeRow.id),
    like_count: likeCountByJokeId.get(jokeRow.id) ?? 0,
  }));
}
