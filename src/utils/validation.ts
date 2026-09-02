/** Pragmatic email check — good enough to catch typos, not RFC 5322. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Counts how many of four rules a password satisfies:
 * length >= 8, contains a digit, contains a letter, length >= 12.
 * Drives the four-bar strength meter on RegisterScreen.
 */
export function passwordStrength(value: string): 0 | 1 | 2 | 3 | 4 {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[a-zA-Z]/.test(value)) score++;
  if (value.length >= 12) score++;
  return score as 0 | 1 | 2 | 3 | 4;
}

/** Mirrors the server's title rule (1-120 chars, trimmed). null = valid. */
export function validateTitle(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 1) return 'Title is required.';
  if (trimmed.length > 120) return 'Title must be 120 characters or fewer.';
  return null;
}
