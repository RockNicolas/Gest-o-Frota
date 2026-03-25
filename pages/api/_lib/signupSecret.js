import crypto from 'node:crypto';

export function isSignupSecretValid(provided, expectedFromEnv) {
  const expected = String(expectedFromEnv || '').trim();
  if (!expected) return false;
  if (typeof provided !== 'string') return false;

  const a = crypto.createHash('sha256').update(provided, 'utf8').digest();
  const b = crypto.createHash('sha256').update(expected, 'utf8').digest();
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function isSignupEnabled() {
  return Boolean(String(globalThis.process.env.SIGNUP_SECRET || '').trim());
}
