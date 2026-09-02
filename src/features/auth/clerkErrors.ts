import { isClerkAPIResponseError } from '@clerk/expo';

const MESSAGES: Record<string, string> = {
  form_identifier_not_found: 'No account found for that email.',
  form_password_incorrect: 'That password doesn’t match.',
  form_identifier_exists: 'An account already exists for that email.',
  form_password_pwned: 'That password is too common. Use something harder to guess.',
  form_password_length_too_short: 'Use at least 8 characters.',
  form_param_format_invalid: 'That email address doesn’t look right.',
  form_code_incorrect: 'That code didn’t work. Check it and try again.',
  too_many_requests: 'Too many attempts. Wait a moment and try again.',
};

export function friendlyAuthError(error: unknown): string {
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    return (first && MESSAGES[first.code]) || first?.longMessage || first?.message || 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}
