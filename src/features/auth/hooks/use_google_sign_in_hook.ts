import { useCallback, useState } from 'react';

import { sign_in_google_service } from '../services/sign_in_google_service';

interface UseGoogleSignInState {
  errorMessage: string | null;
  isPending: boolean;
  signInWithGoogle: () => Promise<void>;
}

export function useGoogleSignInHook(): UseGoogleSignInState {
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signInWithGoogle = useCallback(async () => {
    setErrorMessage(null);
    setIsPending(true);

    try {
      await sign_in_google_service();
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Google sign-in failed.');
      }
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    errorMessage,
    isPending,
    signInWithGoogle,
  };
}
