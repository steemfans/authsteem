/**
 * Validation for /sign/ path and redirect parameter to prevent path traversal,
 * open redirect, and injection (XSS / unsafe URLs).
 */

/** Allowed authority values for signing (subset of Steem key types). */
export const ALLOWED_AUTHORITIES = ['active', 'posting'] as const

/** Type + payload: ops|op|tx and base64url chars only (incl. '.' for padding). */
const SIGN_PAYLOAD_REGEX = /^(ops|op|tx)\/[A-Za-z0-9_.-]+$/

/**
 * Returns true if pathMatch (the part after /sign/) is safe: type is ops/op/tx and
 * payload segment contains only base64url chars. Rejects path traversal ('..' as a
 * segment), control chars, and extra slashes. Note: base64u padding '..' at the end
 * of the payload is allowed (it is not a path-traversal segment).
 */
export function isValidSignPath(pathMatch: string): boolean {
  if (!pathMatch || /[\0\r\n]/.test(pathMatch)) {
    return false
  }
  // Reject '..' only when it appears as a standalone path segment (path traversal),
  // not as base64u padding inside the payload string.
  const segments = pathMatch.split('/')
  if (segments.some((s) => s === '..')) {
    return false
  }
  return SIGN_PAYLOAD_REGEX.test(pathMatch.trim())
}

/**
 * Returns the path part for redirect if valid; otherwise null.
 * Used when handling redirect param so we only navigate to safe /sign/... paths.
 */
export function sanitizeRedirectPath(redirectUri: string): string | null {
  if (!redirectUri || !redirectUri.startsWith('steem://sign/')) {
    return null
  }
  const pathPart = redirectUri.replace(/^steem:\/\/sign\//, '').trim()
  // Reject '..' only when it appears as a standalone path segment (path traversal),
  // not as base64u padding inside the payload string.
  const segments = pathPart.split('/')
  if (segments.some((s) => s === '..') || /[\0\r\n]/.test(pathPart)) {
    return null
  }
  if (!SIGN_PAYLOAD_REGEX.test(pathPart)) {
    return null
  }
  return pathPart
}

/**
 * Returns authority if it is in the allowlist; otherwise fallback.
 */
export function sanitizeAuthority(
  value: string | null | undefined,
  fallback: string
): string {
  if (value && ALLOWED_AUTHORITIES.includes(value as (typeof ALLOWED_AUTHORITIES)[number])) {
    return value
  }
  return fallback
}
