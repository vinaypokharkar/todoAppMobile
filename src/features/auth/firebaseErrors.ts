const MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address doesn’t look right.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found for that email.',
  'auth/wrong-password': 'That password doesn’t match.',
  'auth/invalid-credential': 'Those details don’t match an account.',
  'auth/email-already-in-use': 'An account already exists for that email.',
  'auth/weak-password': 'Use at least 8 characters.',
  'auth/network-request-failed': 'No connection. Check your network and try again.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  'auth/operation-not-allowed': 'This sign-in method isn’t enabled.',
};

export function friendlyAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  return (code && MESSAGES[code]) || 'Something went wrong. Please try again.';
}
