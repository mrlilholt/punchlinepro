import type { Session } from '@supabase/supabase-js';
import type { ReactNode } from 'react';

import { supabase_client } from '../../../lib/supabase';
import { Button } from '../../../shared/components/ui/button';
import { Card } from '../../../shared/components/ui/card';
import { Logo } from '../../../shared/components/ui/logo';
import { useAuthSessionHook } from '../hooks/use_auth_session_hook';
import { SignInGoogleButton } from './sign_in_google_button';

interface AuthGateContainerProps {
  children: (session: Session) => ReactNode;
}

export function AuthGateContainer({ children }: AuthGateContainerProps) {
  const { isLoading, profileSyncErrorMessage, session } = useAuthSessionHook();

  if (isLoading) {
    return (
      <div className="auth-shell">
        <Card className="auth-panel">
          <Logo className="brand-logo-image" />
          <p className="muted-copy">Checking your session...</p>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="auth-shell">
        <Card className="auth-panel">
          <Logo className="brand-logo-image" />
          <h1 className="panel-title">Punchline Pro</h1>
          <p className="muted-copy">
            Guess today&apos;s punchline, unlock the room, and see what everyone else
            guessed.
          </p>
          <SignInGoogleButton />
        </Card>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {profileSyncErrorMessage ? (
        <Card className="profile-sync-warning" role="alert">
          <p className="feedback-error">{profileSyncErrorMessage}</p>
          <p className="muted-copy">
            Guesses still work, but your name may appear as Anonymous until profile sync
            succeeds.
          </p>
        </Card>
      ) : null}
      <header className="top-bar">
        <div className="brand-block">
          <Logo className="brand-mark" />
          <div>
            <p className="brand-title">Punchline Pro</p>
            <p className="brand-subtitle">Daily social joke challenge</p>
          </div>
        </div>
        <Button
          onClick={() => {
            void supabase_client.auth.signOut();
          }}
          variant="ghost"
        >
          Sign out
        </Button>
      </header>
      {children(session)}
    </div>
  );
}
