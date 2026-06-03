import { describe, expect, it } from 'vitest'
import { resolveSigningAuthority } from '@/lib/signing-authority'

describe('resolveSigningAuthority', () => {
  it('requires owner when account_update includes owner authority', () => {
    const ops = [
      [
        'account_update',
        {
          account: 'ety001',
          owner: { weight_threshold: 1, account_auths: [], key_auths: [['STM6rv8rLaJtnhfgQKXbPsfDNscMd79J7pVrG8uVy3PTL4dEMBPz3', 1]] },
          active: { weight_threshold: 1, account_auths: [], key_auths: [['STM6z4ueBGtT96KczqAEzQQTxPUkX5FTVKMEjRb1viFeS2eBSGgKu', 1]] },
          posting: { weight_threshold: 1, account_auths: [], key_auths: [['STM5wP3YpAjReNzHgap6JxjXV56HMkto7NVY9WtsQNBXqM8mzdBmG', 1]] },
          memo_key: 'STM5BPufai2nKA6m14LGpXi6aVMGPbCFNiT4WiK6GdMgVVTRNm4Ad',
          json_metadata: '{}',
        },
      ],
    ]
    expect(resolveSigningAuthority(ops, 'active')).toBe('owner')
  })

  it('keeps active for account_update without owner field', () => {
    const ops = [
      [
        'account_update',
        {
          account: 'ety001',
          json_metadata: '{"profile":{}}',
        },
      ],
    ]
    expect(resolveSigningAuthority(ops, null)).toBe('active')
  })

  it('honors posting query for custom_json posting auth', () => {
    const ops = [
      [
        'custom_json',
        {
          required_auths: [],
          required_posting_auths: ['ety001'],
          id: 'follow',
          json: '{}',
        },
      ],
    ]
    expect(resolveSigningAuthority(ops, 'posting')).toBe('posting')
  })
})
