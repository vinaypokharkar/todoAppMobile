import { isValidEmail, passwordStrength, validateTitle } from '../src/utils/validation';

describe('isValidEmail', () => {
  it('accepts a normal address', () => {
    expect(isValidEmail('vinay@example.com')).toBe(true);
  });

  it('rejects a missing @', () => {
    expect(isValidEmail('vinay.example.com')).toBe(false);
  });

  it('rejects a missing domain', () => {
    expect(isValidEmail('vinay@')).toBe(false);
  });

  it('rejects whitespace', () => {
    expect(isValidEmail('vin ay@example.com')).toBe(false);
  });
});

describe('passwordStrength', () => {
  it('scores 0 for a short password with no letter or digit', () => {
    expect(passwordStrength('!!!')).toBe(0);
  });

  it('scores 1 for a short password containing only a letter', () => {
    expect(passwordStrength('abc')).toBe(1);
  });

  it('scores 2 for a letters-only password of length 8', () => {
    expect(passwordStrength('abcdefgh')).toBe(2);
  });

  it('scores 3 for length >= 8 with a digit and a letter', () => {
    expect(passwordStrength('abcdefg1')).toBe(3);
  });

  it('scores 4 when length >= 12 as well', () => {
    expect(passwordStrength('abcdefgh1234')).toBe(4);
  });
});

describe('validateTitle', () => {
  it('rejects an empty title', () => {
    expect(validateTitle('   ')).not.toBeNull();
  });

  it('rejects a title over 120 characters', () => {
    expect(validateTitle('x'.repeat(121))).not.toBeNull();
  });

  it('accepts a normal title', () => {
    expect(validateTitle('Deploy backend to Render')).toBeNull();
  });
});
