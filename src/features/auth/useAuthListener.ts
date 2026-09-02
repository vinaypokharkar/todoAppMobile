import { useEffect } from 'react';
import { getAuth, onAuthStateChanged, type User } from '@react-native-firebase/auth';
import { useAppDispatch } from '../../app/hooks';
import { sessionResolved } from './authSlice';
import { authApi } from '../../api/authApi';

/**
 * Single source of truth for session state. Mounted once in App.tsx.
 * Fires immediately on cold start with the persisted user (or null),
 * which is what lets the splash screen resolve without a login flash.
 */
export function useAuthListener(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user: User | null) => {
      dispatch(
        sessionResolved(
          user
            ? {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
              }
            : null,
        ),
      );

      // Ensure the Mongo profile row exists for this uid.
      if (user) dispatch(authApi.endpoints.syncProfile.initiate());
    });

    return unsubscribe;
  }, [dispatch]);
}
