import { describe, it, expect, vi, beforeEach } from 'vitest'

// Simple unit tests for keychain crypto functions
describe('Keychain Crypto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('can import keychain-crypto module', async () => {
    const { encryptKeys, decryptKeys, isWebCryptoFormat } = await import('@/lib/keychain-crypto')
    expect(typeof encryptKeys).toBe('function')
    expect(typeof decryptKeys).toBe('function')
    expect(typeof isWebCryptoFormat).toBe('function')
  })

  it('isWebCryptoFormat validates payload correctly', async () => {
    const { isWebCryptoFormat } = await import('@/lib/keychain-crypto')
    
    // Valid format
    const validPayload = JSON.stringify({
      version: 'webcrypto-v1',
      salt: 'abc123',
      iv: 'def456',
      ciphertext: 'ghi789',
    })
    const result1 = isWebCryptoFormat(validPayload)
    expect(result1).toBeTruthy()

    // Invalid format - missing version
    const invalidPayload1 = JSON.stringify({
      salt: 'abc123',
      iv: 'def456',
      ciphertext: 'ghi789',
    })
    expect(isWebCryptoFormat(invalidPayload1)).toBe(false)

    // Invalid format - wrong version
    const invalidPayload2 = JSON.stringify({
      version: 'triplesec',
      salt: 'abc123',
      iv: 'def456',
      ciphertext: 'ghi789',
    })
    expect(isWebCryptoFormat(invalidPayload2)).toBe(false)

    // Invalid format - not JSON
    expect(isWebCryptoFormat('not json')).toBe(false)
  })
})
