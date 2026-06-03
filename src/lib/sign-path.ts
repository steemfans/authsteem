/**
 * Validation for /sign/ path and redirect parameter to prevent path traversal,
 * open redirect, and injection (XSS / unsafe URLs).
 */

/** Allowed authority values for signing (subset of Steem key types). */
export const ALLOWED_AUTHORITIES = ['active', 'posting'] as const

/** Type + payload: ops|op|tx and base64url chars only (incl. '.' for padding). */
const SIGN_PAYLOAD_REGEX = /^(ops|op|tx)\/[A-Za-z0-9_.-]+$/

const ACCOUNT_NAME_REGEX = /^[a-z0-9.-]{1,16}$/i
const BASE64U_REGEX = /^[A-Za-z0-9_.-]+$/

function sanitizeSignQuery(search: string): string {
  if (!search) return ''
  const raw = search.startsWith('?') ? search.slice(1) : search
  if (!raw) return ''
  const params = new URLSearchParams(raw)
  const out = new URLSearchParams()

  const signer = params.get('s')?.trim()
  if (signer && ACCOUNT_NAME_REGEX.test(signer)) {
    out.set('s', signer)
  }

  const authority = params.get('authority')
  if (authority && ALLOWED_AUTHORITIES.includes(authority as (typeof ALLOWED_AUTHORITIES)[number])) {
    out.set('authority', authority)
  }

  if (params.has('nb')) {
    out.set('nb', '')
  }

  const callback = params.get('cb')?.trim()
  if (callback && BASE64U_REGEX.test(callback)) {
    out.set('cb', callback)
  }

  const qs = out.toString()
  return qs ? `?${qs}` : ''
}

function extractSignPathAndQuery(pathPart: string): { signPath: string; query: string } {
  const qIdx = pathPart.indexOf('?')
  if (qIdx < 0) {
    return { signPath: pathPart, query: '' }
  }
  return {
    signPath: pathPart.slice(0, qIdx),
    query: pathPart.slice(qIdx),
  }
}

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
  const { signPath, query } = extractSignPathAndQuery(pathPart)
  if (/[\0\r\n]/.test(signPath)) {
    return null
  }
  if (!isValidSignPath(signPath)) {
    return null
  }
  return signPath + sanitizeSignQuery(query)
}

/**
 * Build a safe /sign/... return path after login from redirect + optional authority.
 */
export function buildSignReturnPath(
  redirectUri: string | null | undefined,
  authority: string
): string | null {
  const pathPart = redirectUri ? sanitizeRedirectPath(redirectUri) : null
  if (pathPart === null) return null

  const safeAuthority = sanitizeAuthority(authority, 'active')
  if (safeAuthority === 'active' || pathPart.includes('authority=')) {
    return `/sign/${pathPart}`
  }

  const sep = pathPart.includes('?') ? '&' : '?'
  return `/sign/${pathPart}${sep}authority=${safeAuthority}`
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
