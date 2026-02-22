import { Bookmark, Heart, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import { Button } from '../../../shared/components/ui/button';
import { Card } from '../../../shared/components/ui/card';
import type { JokeHistoryListItem } from '../../../shared/types/database_types';
import { get_release_slot_label } from '../../../shared/utils/date_helpers';
import { merge_class_names } from '../../../shared/utils/merge_class_names';
import { useJokeHistoryQueryHook } from '../hooks/use_joke_history_query_hook';
import { useToggleJokeFavoriteMutationHook } from '../hooks/use_toggle_joke_favorite_mutation_hook';
import { useToggleJokeLikeMutationHook } from '../hooks/use_toggle_joke_like_mutation_hook';

type JokeLibraryTab = 'history' | 'favorites';

interface JokeHistoryPanelProps {
  forcedTab?: JokeLibraryTab;
  hideTabBar?: boolean;
  subtitleText?: string;
  titleText?: string;
  userId: string;
}

function format_joke_date(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);

  if (!year || !month || !day) {
    return dateKey;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function JokeHistoryRow({
  jokeItem,
  onToggleFavorite,
  onToggleLike,
  isTogglingFavorite,
  isTogglingLike,
}: {
  jokeItem: JokeHistoryListItem;
  onToggleFavorite: (jokeItem: JokeHistoryListItem) => void;
  onToggleLike: (jokeItem: JokeHistoryListItem) => void;
  isTogglingFavorite: boolean;
  isTogglingLike: boolean;
}) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="joke-history-row"
      initial={{ opacity: 0, y: 6 }}
      layout
    >
      <div className="joke-history-row-header">
        <div>
          <p className="guess-author">{jokeItem.setup}</p>
          <p className="guess-meta">
            {format_joke_date(jokeItem.joke_date)} · {get_release_slot_label(jokeItem.release_slot)}
          </p>
        </div>
        <div className="joke-history-actions">
          <Button
            aria-label={jokeItem.is_liked ? 'Unlike joke' : 'Like joke'}
            className={merge_class_names(
              'history-action-button',
              jokeItem.is_liked && 'history-action-button-active',
            )}
            disabled={isTogglingLike}
            onClick={() => {
              onToggleLike(jokeItem);
            }}
            variant="ghost"
          >
            <Heart aria-hidden="true" size={16} />
            <span>{jokeItem.like_count}</span>
          </Button>
          <Button
            aria-label={jokeItem.is_favorited ? 'Remove from favorites' : 'Save to favorites'}
            className={merge_class_names(
              'history-action-button',
              jokeItem.is_favorited && 'history-action-button-active',
            )}
            disabled={isTogglingFavorite}
            onClick={() => {
              onToggleFavorite(jokeItem);
            }}
            variant="ghost"
          >
            <Bookmark aria-hidden="true" size={16} />
          </Button>
        </div>
      </div>
      <p className="joke-history-punchline">{jokeItem.punchline}</p>
    </motion.article>
  );
}

export function JokeHistoryPanel({
  forcedTab,
  hideTabBar = false,
  subtitleText = 'History + favorites',
  titleText = 'Joke Library',
  userId,
}: JokeHistoryPanelProps) {
  const [activeTab, setActiveTab] = useState<JokeLibraryTab>('history');
  const jokeHistoryQuery = useJokeHistoryQueryHook(userId);
  const toggleJokeLikeMutation = useToggleJokeLikeMutationHook(userId);
  const toggleJokeFavoriteMutation = useToggleJokeFavoriteMutationHook(userId);
  const resolvedTab = forcedTab ?? activeTab;

  const visibleJokes = useMemo(() => {
    const historyRows = jokeHistoryQuery.data ?? [];

    if (resolvedTab === 'favorites') {
      return historyRows.filter((historyRow) => historyRow.is_favorited);
    }

    return historyRows;
  }, [jokeHistoryQuery.data, resolvedTab]);

  return (
    <Card className="leaderboard-panel">
      <div className="results-header">
        <div className="joke-library-title-block">
          <p className="panel-eyebrow">{titleText}</p>
          <span className="muted-copy">{subtitleText}</span>
        </div>
        <History aria-hidden="true" className="muted-icon" size={16} />
      </div>
      {!hideTabBar && !forcedTab ? (
        <div className="joke-library-tabs" role="tablist" aria-label="Joke library tabs">
          <button
            className={merge_class_names(
              'joke-library-tab',
              activeTab === 'history' && 'joke-library-tab-active',
            )}
            onClick={() => {
              setActiveTab('history');
            }}
            role="tab"
            type="button"
          >
            History
          </button>
          <button
            className={merge_class_names(
              'joke-library-tab',
              activeTab === 'favorites' && 'joke-library-tab-active',
            )}
            onClick={() => {
              setActiveTab('favorites');
            }}
            role="tab"
            type="button"
          >
            Favorites
          </button>
        </div>
      ) : null}

      {jokeHistoryQuery.isLoading ? <p className="muted-copy">Loading joke history...</p> : null}
      {jokeHistoryQuery.error ? (
        <p className="feedback-error">Joke history unavailable. Apply the new migrations first.</p>
      ) : null}

      {!jokeHistoryQuery.isLoading && !jokeHistoryQuery.error ? (
        <div className="joke-history-stack">
          {visibleJokes.length ? (
            visibleJokes.map((jokeItem) => (
              <JokeHistoryRow
                isTogglingFavorite={toggleJokeFavoriteMutation.isPending}
                isTogglingLike={toggleJokeLikeMutation.isPending}
                jokeItem={jokeItem}
                key={jokeItem.id}
                onToggleFavorite={(selectedJoke) => {
                  void toggleJokeFavoriteMutation.mutateAsync({
                    isFavorited: selectedJoke.is_favorited,
                    jokeId: selectedJoke.id,
                  });
                }}
                onToggleLike={(selectedJoke) => {
                  void toggleJokeLikeMutation.mutateAsync({
                    isLiked: selectedJoke.is_liked,
                    jokeId: selectedJoke.id,
                  });
                }}
              />
            ))
          ) : (
            <p className="muted-copy">
              {resolvedTab === 'favorites'
                ? 'No favorites yet. Save jokes here with the bookmark button.'
                : 'No joke history found yet.'}
            </p>
          )}
        </div>
      ) : null}
    </Card>
  );
}
