import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { supabase_client } from '../../../lib/supabase';
import { sync_profile_service } from '../services/sync_profile_service';

interface UseAuthSessionState {
  isLoading: boolean;
  profileSyncErrorMessage: string | null;
  session: Session | null;
}

function get_profile_sync_error_message(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return `Profile sync failed: ${error.message}`;
  }

  return 'Profile sync failed. Your name may appear as Anonymous until sync succeeds.';
}

export function useAuthSessionHook(): UseAuthSessionState {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileSyncErrorMessage, setProfileSyncErrorMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase_client.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        setProfileSyncErrorMessage(null);
        setSession(null);
      } else {
        if (data.session?.user) {
          try {
            await sync_profile_service(data.session.user);
            if (isMounted) {
              setProfileSyncErrorMessage(null);
            }
          } catch (syncError) {
            if (isMounted) {
              setProfileSyncErrorMessage(get_profile_sync_error_message(syncError));
            }
            console.warn('Profile sync failed during session load.', syncError);
          }
        } else {
          setProfileSyncErrorMessage(null);
        }

        if (!isMounted) {
          return;
        }
        setSession(data.session);
      }

      setIsLoading(false);
    };

    const { data: auth_subscription } = supabase_client.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (nextSession?.user) {
          void sync_profile_service(nextSession.user)
            .then(() => {
              if (isMounted) {
                setProfileSyncErrorMessage(null);
              }
            })
            .catch((syncError) => {
              if (isMounted) {
                setProfileSyncErrorMessage(get_profile_sync_error_message(syncError));
              }
              console.warn('Profile sync failed after auth state change.', syncError);
            });
        } else {
          setProfileSyncErrorMessage(null);
        }

        setSession(nextSession);
        setIsLoading(false);
      },
    );

    void loadSession();

    return () => {
      isMounted = false;
      auth_subscription.subscription.unsubscribe();
    };
  }, []);

  return {
    isLoading,
    profileSyncErrorMessage,
    session,
  };
}
