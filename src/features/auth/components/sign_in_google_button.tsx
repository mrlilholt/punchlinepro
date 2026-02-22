import { Chrome } from 'lucide-react';

import { Button } from '../../../shared/components/ui/button';
import { useGoogleSignInHook } from '../hooks/use_google_sign_in_hook';

export function SignInGoogleButton() {
  const { errorMessage, isPending, signInWithGoogle } = useGoogleSignInHook();

  return (
    <div className="auth-button-stack">
      <Button disabled={isPending} onClick={() => void signInWithGoogle()}>
        <Chrome aria-hidden="true" size={18} />
        {isPending ? 'Connecting...' : 'Continue with Google'}
      </Button>
      {errorMessage ? <p className="feedback-error">{errorMessage}</p> : null}
    </div>
  );
}
