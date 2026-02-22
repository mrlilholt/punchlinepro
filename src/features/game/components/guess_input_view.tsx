import { motion } from 'framer-motion';
import { useState } from 'react';

import type { DailyJokeRecord } from '../../../shared/types/database_types';
import { Button } from '../../../shared/components/ui/button';
import { Card } from '../../../shared/components/ui/card';
import { useSubmitGuessMutationHook } from '../hooks/use_submit_guess_mutation_hook';

interface GuessInputViewProps {
  joke: DailyJokeRecord;
  userId: string;
}

export function GuessInputView({ joke, userId }: GuessInputViewProps) {
  const [guessText, setGuessText] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const isFallbackJoke = Boolean(joke.is_fallback);

  const submitGuessMutation = useSubmitGuessMutationHook(userId, joke.id);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isFallbackJoke) {
      setFeedbackMessage(
        'Showing a local fallback joke. Add a row to daily_jokes to enable scoring and reveal.',
      );
      return;
    }

    try {
      const submissionResult = await submitGuessMutation.mutateAsync(guessText);
      setFeedbackMessage(submissionResult.fuzzyFeedback);
    } catch (error) {
      if (error instanceof Error) {
        setFeedbackMessage(error.message);
      } else {
        setFeedbackMessage('Unable to submit guess right now.');
      }
    }
  };

  return (
    <Card className="game-panel">
      <div className="panel-copy">
        <p className="panel-eyebrow">Today&apos;s setup</p>
        <h2 className="panel-title">{joke.setup}</h2>
      </div>
      <form className="guess-form" onSubmit={handleSubmit}>
        <label className="input-label" htmlFor="guess-input">
          Your punchline
        </label>
        <textarea
          className="guess-textarea"
          id="guess-input"
          maxLength={260}
          onChange={(event) => {
            setGuessText(event.target.value);
          }}
          placeholder="Type your best line..."
          value={guessText}
        />
        <div className="form-footer">
          <p className="muted-copy">
            {isFallbackJoke
              ? 'Local fallback mode: rendering works, but submission is disabled until a database joke exists.'
              : 'Submit once to unlock everyone else&apos;s guesses.'}
          </p>
          <Button disabled={submitGuessMutation.isPending || isFallbackJoke} type="submit">
            {submitGuessMutation.isPending ? 'Scoring...' : 'Submit Guess'}
          </Button>
        </div>
      </form>
      {feedbackMessage ? (
        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="feedback-note"
          initial={{ opacity: 0, y: 8 }}
        >
          {feedbackMessage}
        </motion.p>
      ) : null}
    </Card>
  );
}
