import { AnimatePresence, motion } from 'framer-motion';

import { Card } from '../../../shared/components/ui/card';
import type {
  DailyJokeRecord,
  UserGuessStatusRecord,
} from '../../../shared/types/database_types';
import { useGuessFeedQueryHook } from '../hooks/use_guess_feed_query_hook';
import { useJokePunchlineQueryHook } from '../hooks/use_joke_punchline_query_hook';

interface ResultsViewProps {
  joke: DailyJokeRecord;
  userGuessStatus: UserGuessStatusRecord;
}

function PunchlineReveal({ punchline }: { punchline: string }) {
  const punchline_words = punchline.trim().split(/\s+/).filter(Boolean);

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="punchline-reveal"
      initial={{ opacity: 0, scale: 0.98, y: 8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="punchline-reveal-badge"
        initial={{ opacity: 0, y: -6 }}
        transition={{ delay: 0.06, duration: 0.24 }}
      >
        Punchline Reveal
      </motion.div>
      <motion.p
        className="punchline-reveal-text"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              delayChildren: 0.12,
              staggerChildren: 0.035,
            },
          },
        }}
      >
        {punchline_words.map((word, word_index) => (
          <motion.span
            className="punchline-reveal-word"
            key={`${word}-${word_index}`}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: 'spring',
                  stiffness: 280,
                  damping: 24,
                },
              },
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.p>
    </motion.div>
  );
}

function get_guess_display_name(
  profiles:
    | {
        display_name: string | null;
      }
    | {
        display_name: string | null;
      }[]
    | null,
): string {
  if (Array.isArray(profiles)) {
    return profiles[0]?.display_name ?? 'Anonymous';
  }

  return profiles?.display_name ?? 'Anonymous';
}

function get_score_message(
  score: number,
  isCorrect: boolean,
): string {
  if (isCorrect) {
    return 'Perfect match. You cracked it.';
  }

  if (score > 0.6 && score < 0.8) {
    return 'So close! Try again?';
  }

  return 'Swing again tomorrow.';
}

function get_points_from_similarity(similarityScore: number): number {
  return Number((similarityScore * 100).toFixed(1));
}

export function ResultsView({ joke, userGuessStatus }: ResultsViewProps) {
  const guessFeedQuery = useGuessFeedQueryHook(joke.id, true);
  const jokePunchlineQuery = useJokePunchlineQueryHook(joke.id, true);

  return (
    <div className="game-stack">
      <Card className="game-panel">
        <p className="panel-eyebrow">Your result</p>
        <h2 className="panel-title">{joke.setup}</h2>
        <p className="score-copy">
          Similarity score: {(userGuessStatus.similarity_score * 100).toFixed(1)}%
        </p>
        <p className="score-copy">
          Points earned: {get_points_from_similarity(userGuessStatus.similarity_score).toFixed(1)}
        </p>
        <p className="feedback-note">
          {get_score_message(
            userGuessStatus.similarity_score,
            userGuessStatus.is_correct,
          )}
        </p>
        <div className="punchline-reveal-shell">
          <p className="panel-eyebrow">Official punchline</p>
          {jokePunchlineQuery.isLoading ? (
            <motion.div
              animate={{ opacity: [0.35, 0.8, 0.35] }}
              className="punchline-reveal-skeleton"
              transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY }}
            />
          ) : null}
          {!jokePunchlineQuery.isLoading && jokePunchlineQuery.data?.punchline ? (
            <PunchlineReveal punchline={jokePunchlineQuery.data.punchline} />
          ) : null}
          {jokePunchlineQuery.error ? (
            <p className="muted-copy">Could not load the punchline reveal.</p>
          ) : null}
        </div>
      </Card>
      <Card className="results-panel">
        <div className="results-header">
          <p className="panel-eyebrow">Live guess feed</p>
          <span className="muted-copy">Updates every 5s</span>
        </div>
        <AnimatePresence initial={false}>
          {(guessFeedQuery.data ?? []).map((guessRow) => (
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className="guess-row"
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: 8 }}
              key={guessRow.id}
              layout
            >
              <p className="guess-author">{get_guess_display_name(guessRow.profiles)}</p>
              <p className="guess-text">{guessRow.guess_text}</p>
              <p className="guess-meta">
                {(guessRow.similarity_score * 100).toFixed(1)}% similarity
              </p>
            </motion.article>
          ))}
        </AnimatePresence>
        {!guessFeedQuery.data?.length ? (
          <p className="muted-copy">No guesses yet. You&apos;re first in the room.</p>
        ) : null}
      </Card>
    </div>
  );
}
