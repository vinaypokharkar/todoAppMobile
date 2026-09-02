import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/expo';
import { useAppDispatch } from '../../app/hooks';
import { sessionResolved } from './authSlice';
import { authApi } from '../../api/authApi';

/**
 * Single source of truth for session state. Mounted once in App.tsx.
 * Fires once Clerk reports the persisted session, which is what lets the
 * splash screen resolve without a login flash.
 */
export function useAuthListener(): void {
  const dispatch = useAppDispatch();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    dispatch(
      sessionResolved(
        isSignedIn && userId
          ? {
              uid: userId,
              email: user?.primaryEmailAddress?.emailAddress ?? null,
              displayName: user?.fullName ?? user?.username ?? null,
              photoURL: user?.imageUrl ?? null,
            }
          : null,
      ),
    );

    // Ensure the Mongo profile row exists for this uid.
    if (isSignedIn) dispatch(authApi.endpoints.syncProfile.initiate());
  }, [dispatch, isLoaded, isSignedIn, userId, user]);
}
