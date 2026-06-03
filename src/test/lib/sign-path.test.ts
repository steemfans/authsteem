import { describe, expect, it } from 'vitest'
import { buildSignReturnPath, isValidSignPath, sanitizeRedirectPath } from '@/lib/sign-path'

const SAMPLE_OPS_PATH = 'ops/W1siYWNjb3VudF91cGRhdGUiXX0.'

describe('sign-path', () => {
  it('accepts ops path with base64u padding dots', () => {
    expect(isValidSignPath('ops/W1..')).toBe(true)
  })

  it('sanitizeRedirectPath strips and preserves safe query params', () => {
    const uri = `steem://sign/${SAMPLE_OPS_PATH}?s=ety001`
    expect(sanitizeRedirectPath(uri)).toBe(`${SAMPLE_OPS_PATH}?s=ety001`)
  })

  it('sanitizeRedirectPath rejects unsafe query params', () => {
    const uri = `steem://sign/${SAMPLE_OPS_PATH}?next=https://evil.test`
    expect(sanitizeRedirectPath(uri)).toBe(SAMPLE_OPS_PATH)
  })

  it('buildSignReturnPath returns sign route with query', () => {
    const uri = `steem://sign/${SAMPLE_OPS_PATH}?s=ety001`
    expect(buildSignReturnPath(uri, 'active')).toBe(`/sign/${SAMPLE_OPS_PATH}?s=ety001`)
  })

  it('buildSignReturnPath appends posting authority when needed', () => {
    const uri = `steem://sign/${SAMPLE_OPS_PATH}?s=ety001`
    expect(buildSignReturnPath(uri, 'posting')).toBe(
      `/sign/${SAMPLE_OPS_PATH}?s=ety001&authority=posting`
    )
  })
})
