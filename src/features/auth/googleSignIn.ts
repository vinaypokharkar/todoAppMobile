import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getAuth, GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';
import { WEB_CLIENT_ID } from '../../config/env';

/** Call once at app start, before any sign-in attempt. */
export function configureGoogleSignIn(): void {
  GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
}

export async function signInWithGoogle(): Promise<void> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  // ⚠ v13+ returns { type, data } — NOT a bare user object. Older
  // tutorials destructure `idToken` directly off the result and break.
  const response = await GoogleSignin.signIn();
  if (response.type !== 'success') return; // user cancelled

  const idToken = response.data.idToken;
  if (!idToken) throw new Error('Google sign-in returned no ID token');

  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(getAuth(), credential);
  // onAuthStateChanged then drives the navigation switch.
}
