import type { ReleaseSlotType } from '../utils/date_helpers';

export interface DailyJokeRecord {
  id: string;
  joke_date: string;
  release_slot?: ReleaseSlotType;
  setup: string;
  is_fallback?: boolean;
}

export interface JokePunchlineRecord {
  id: string;
  punchline: string;
}

export interface UserGuessStatusRecord {
  id: string;
  joke_id: string;
  user_id: string;
  guess_text: string;
  is_correct: boolean;
  similarity_score: number;
  created_at: string;
}

export interface GuessFeedRecord extends UserGuessStatusRecord {
  profiles:
    | {
        display_name: string | null;
      }
    | {
        display_name: string | null;
      }[]
    | null;
}

export interface GuessSimilarityResult {
  is_correct: boolean;
  score: number;
}

export interface GuessSubmissionResult {
  isCorrect: boolean;
  score: number;
  fuzzyFeedback: string | null;
}

export interface LeaderboardRecord {
  id: string;
  display_name: string | null;
  total_score: number;
}

export interface JokeHistoryBaseRecord {
  id: string;
  joke_date: string;
  punchline: string;
  release_slot: ReleaseSlotType;
  setup: string;
  source_api_id: string | null;
}

export interface JokeHistoryListItem extends JokeHistoryBaseRecord {
  is_favorited: boolean;
  is_liked: boolean;
  like_count: number;
}
