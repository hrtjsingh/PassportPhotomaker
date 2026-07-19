import { useAuth } from '@clerk/clerk-react';
import { useEffect, type ReactNode } from 'react';
import { clearMlAuth, registerMlAuth } from '../utils/mlAuth';
import { restartModelPreload } from '../utils/modelPreload';

/** Sync Clerk session into ML routing + restart preload on auth change. */
export function ClerkAuthBridge({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    registerMlAuth({
      isSignedIn: () => Boolean(isSignedIn),
      getToken: () => getToken(),
    });
    return () => clearMlAuth();
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (!isLoaded) return;
    void restartModelPreload();
  }, [isLoaded, isSignedIn]);

  return children;
}
