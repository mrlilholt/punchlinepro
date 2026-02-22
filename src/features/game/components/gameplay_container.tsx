import { motion } from 'framer-motion';

import { Card } from '../../../shared/components/ui/card';
import { useDailyJokeQueryHook } from '../hooks/use_daily_joke_query_hook';
import { useUserGuessStatusQueryHook } from '../hooks/use_user_guess_status_query_hook';
import { GuessInputView } from './guess_input_view';
import { JokeSkeletonView } from './joke_skeleton_view';
import { ResultsView } from './results_view';

interface GameplayContainerProps {
  userId: string;
}

export function GameplayContainer({ userId }: GameplayContainerProps) {
  const dailyJokeQuery = useDailyJokeQueryHook(userId);
  const activeJokeIdForGuessStatus =
    dailyJokeQuery.data && !dailyJokeQuery.data.is_fallback
      ? dailyJokeQuery.data.id
      : null;

  const guessStatusQuery = useUserGuessStatusQueryHook(
    userId,
    activeJokeIdForGuessStatus,
  );

  if (dailyJokeQuery.isLoading || guessStatusQuery.isLoading) {
    return <JokeSkeletonView />;
  }

  if (dailyJokeQuery.error) {
    return (
      <Card className="game-panel">
        <p className="feedback-error">Unable to load today&apos;s joke.</p>
      </Card>
    );
  }

  if (!dailyJokeQuery.data) {
    return (
      <Card className="game-panel">
        <p className="muted-copy">Today&apos;s joke is not available yet.</p>
      </Card>
    );
  }

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.28 }}
    >
      {guessStatusQuery.data ? (
        <ResultsView joke={dailyJokeQuery.data} userGuessStatus={guessStatusQuery.data} />
      ) : (
        <GuessInputView joke={dailyJokeQuery.data} userId={userId} />
      )}
    </motion.section>
  );
}
