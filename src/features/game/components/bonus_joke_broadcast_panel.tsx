import { Radio, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import { Button } from '../../../shared/components/ui/button';
import { Card } from '../../../shared/components/ui/card';
import type { BonusJokeRecord } from '../../../shared/types/database_types';
import { useBonusJokeBroadcastQueryHook } from '../hooks/use_bonus_joke_broadcast_query_hook';
import { useSubmitBonusJokeMutationHook } from '../hooks/use_submit_bonus_joke_mutation_hook';

interface BonusJokeBroadcastPanelProps {
  userId: string;
}

function get_bonus_joke_author_name(bonusJoke: BonusJokeRecord): string {
  const profileShape = bonusJoke.profiles;

  if (Array.isArray(profileShape)) {
    return profileShape[0]?.display_name ?? 'Anonymous';
  }

  if (profileShape && typeof profileShape === 'object') {
    return profileShape.display_name ?? 'Anonymous';
  }

  return 'Anonymous';
}

function format_bonus_joke_timestamp(createdAt: string): string {
  const parsedDate = new Date(createdAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Just now';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsedDate);
}

export function BonusJokeBroadcastPanel({ userId }: BonusJokeBroadcastPanelProps) {
  const [setupText, setSetupText] = useState('');
  const [punchlineText, setPunchlineText] = useState('');
  const [localFormError, setLocalFormError] = useState<string | null>(null);

  const bonusJokeBroadcastQuery = useBonusJokeBroadcastQueryHook();
  const submitBonusJokeMutation = useSubmitBonusJokeMutationHook(userId);

  const latestBonusJoke = bonusJokeBroadcastQuery.data?.[0] ?? null;
  const recentBonusJokes = useMemo(
    () => (bonusJokeBroadcastQuery.data ?? []).slice(1, 4),
    [bonusJokeBroadcastQuery.data],
  );

  async function handle_bonus_joke_submit() {
    setLocalFormError(null);

    try {
      await submitBonusJokeMutation.mutateAsync({
        punchlineText,
        setupText,
      });
      setSetupText('');
      setPunchlineText('');
    } catch (error) {
      setLocalFormError(error instanceof Error ? error.message : 'Unable to broadcast bonus joke.');
    }
  }

  return (
    <Card className="leaderboard-panel bonus-joke-panel">
      <div className="results-header">
        <div className="joke-library-title-block">
          <p className="panel-eyebrow">Bonus Joke Broadcast</p>
          <span className="muted-copy">Anyone can submit a bonus joke for the room</span>
        </div>
        <div className="release-countdown-chip">
          <Radio aria-hidden="true" size={14} />
          <span>Live</span>
        </div>
      </div>

      <div className="bonus-joke-form-shell">
        <label className="input-label" htmlFor="bonus-joke-setup">
          Bonus setup
        </label>
        <textarea
          className="guess-textarea bonus-joke-textarea"
          id="bonus-joke-setup"
          maxLength={240}
          onChange={(event) => {
            setSetupText(event.target.value);
          }}
          placeholder="Write the setup/question everyone should hear..."
          value={setupText}
        />

        <label className="input-label" htmlFor="bonus-joke-punchline">
          Bonus punchline
        </label>
        <textarea
          className="guess-textarea bonus-joke-textarea bonus-joke-textarea-short"
          id="bonus-joke-punchline"
          maxLength={240}
          onChange={(event) => {
            setPunchlineText(event.target.value);
          }}
          placeholder="Drop the punchline/answer..."
          value={punchlineText}
        />

        <div className="form-footer">
          <p className="muted-copy bonus-joke-helper">
            Broadcasts show up for everyone in the bonus feed.
          </p>
          <Button
            disabled={submitBonusJokeMutation.isPending}
            onClick={() => {
              void handle_bonus_joke_submit();
            }}
            variant="secondary"
          >
            <Sparkles aria-hidden="true" size={16} />
            {submitBonusJokeMutation.isPending ? 'Broadcasting...' : 'Broadcast Bonus Joke'}
          </Button>
        </div>

        {localFormError ? <p className="feedback-error">{localFormError}</p> : null}
      </div>

      <div className="bonus-joke-broadcast-stack">
        <div className="results-header bonus-joke-broadcast-header">
          <p className="panel-eyebrow">Latest Bonus Drop</p>
          <span className="muted-copy">Refreshes every 10s</span>
        </div>

        {bonusJokeBroadcastQuery.isLoading ? (
          <p className="muted-copy">Loading bonus broadcast...</p>
        ) : null}

        {bonusJokeBroadcastQuery.error ? (
          <p className="feedback-error">
            Bonus broadcast unavailable. Apply the new migration first.
          </p>
        ) : null}

        {!bonusJokeBroadcastQuery.isLoading && !bonusJokeBroadcastQuery.error && latestBonusJoke ? (
          <motion.article
            animate={{ opacity: 1, y: 0 }}
            className="bonus-joke-feature"
            initial={{ opacity: 0.65, y: 6 }}
            key={latestBonusJoke.id}
            transition={{ duration: 0.22 }}
          >
            <p className="guess-author">{latestBonusJoke.setup}</p>
            <p className="bonus-joke-punchline">{latestBonusJoke.punchline}</p>
            <p className="guess-meta">
              {get_bonus_joke_author_name(latestBonusJoke)} ·{' '}
              {format_bonus_joke_timestamp(latestBonusJoke.created_at)}
            </p>
          </motion.article>
        ) : null}

        {!bonusJokeBroadcastQuery.isLoading &&
        !bonusJokeBroadcastQuery.error &&
        !latestBonusJoke ? (
          <p className="muted-copy">No bonus jokes yet. Broadcast the first one.</p>
        ) : null}

        {!bonusJokeBroadcastQuery.isLoading &&
        !bonusJokeBroadcastQuery.error &&
        recentBonusJokes.length ? (
          <div className="bonus-joke-recent-stack">
            <p className="panel-eyebrow">Recent Bonus Jokes</p>
            {recentBonusJokes.map((bonusJokeRow) => (
              <article className="bonus-joke-row" key={bonusJokeRow.id}>
                <p className="guess-author">{bonusJokeRow.setup}</p>
                <p className="guess-text">{bonusJokeRow.punchline}</p>
                <p className="guess-meta">
                  {get_bonus_joke_author_name(bonusJokeRow)} ·{' '}
                  {format_bonus_joke_timestamp(bonusJokeRow.created_at)}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
