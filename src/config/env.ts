import { API_OVERRIDE } from './apiMode.generated';

const PRODUCTION_API = 'https://todo-app-server-XXXX.onrender.com';

/**
 * API_OVERRIDE is written by scripts/run-android.ps1 based on the device
 * and mode you pick at launch (emulator vs USB phone, local vs deployed).
 * __DEV__ is injected by Metro, so release builds always hit production
 * regardless of what's left in the generated file.
 */
export const API_BASE_URL = __DEV__ && API_OVERRIDE ? API_OVERRIDE : PRODUCTION_API;

/** Clerk publishable key — safe to embed client-side. From the Clerk dashboard. */
export const CLERK_PUBLISHABLE_KEY = 'pk_test_cGxlYXNpbmctc2hhZC04NzU5LmNsZXJrLmFjY291bnRzLmRldiQ';

/** Render free tier cold-starts. Give the first request room. */
export const REQUEST_TIMEOUT_MS = 60_000;
