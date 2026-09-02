import { Platform } from 'react-native';

/**
 * The emulator cannot reach the host's `localhost`. Two options while
 * developing against a local server:
 *   1. `adb reverse tcp:3000 tcp:3000`  -> then use http://localhost:3000
 *   2. use the emulator alias           -> http://10.0.2.2:3000
 * Option 1 is preferred because the same URL then works on a physical
 * device connected over USB.
 */
const LOCAL_API = Platform.select({
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
})!;

const PRODUCTION_API = 'https://todo-app-server-XXXX.onrender.com';

/** __DEV__ is injected by Metro. Release builds always hit production. */
export const API_BASE_URL = __DEV__ ? PRODUCTION_API : PRODUCTION_API;
// ^ Flip the __DEV__ branch to LOCAL_API when working against a local server.

/** OAuth 2.0 Web client ID from google-services.json (client_type === 3). */
export const WEB_CLIENT_ID = 'XXXXXXXXXXXX-xxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com';

/** Render free tier cold-starts. Give the first request room. */
export const REQUEST_TIMEOUT_MS = 60_000;

// Silence an unused-var lint on LOCAL_API when __DEV__ points at PRODUCTION_API.
void LOCAL_API;
