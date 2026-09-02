import * as SecureStore from 'expo-secure-store';
import type { TokenCache } from '@clerk/expo';

/** Persists Clerk's session JWT in the device keystore/keychain. */
export const tokenCache: TokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // best-effort — worst case the user is asked to sign in again
    }
  },
};
