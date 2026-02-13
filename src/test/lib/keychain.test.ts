import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Keychain Storage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('getKeychain returns empty object when no keychain exists', async () => {
    const { getKeychain } = await import('@/lib/keychain')
    expect(getKeychain()).toEqual({})
  })

  it('getKeychain returns stored keychain', async () => {
    const { getKeychain, addToKeychain } = await import('@/lib/keychain')
    const mockEncrypted = JSON.stringify({
      version: 'webcrypto-v1',
      salt: 'abc',
      iv: 'def',
      ciphertext: 'ghi',
    })
    addToKeychain('testuser', mockEncrypted)
    expect(getKeychain()).toEqual({ testuser: mockEncrypted })
  })

  it('removeFromKeychain removes user', async () => {
    const { getKeychain, addToKeychain, removeFromKeychain } = await import('@/lib/keychain')
    const mockEncrypted = JSON.stringify({
      version: 'webcrypto-v1',
      salt: 'abc',
      iv: 'def',
      ciphertext: 'ghi',
    })
    addToKeychain('user1', mockEncrypted)
    addToKeychain('user2', mockEncrypted)
    removeFromKeychain('user1')
    expect(getKeychain()).toEqual({ user2: mockEncrypted })
  })

  it('hasAccounts returns correct value', async () => {
    const { hasAccounts, addToKeychain } = await import('@/lib/keychain')
    expect(hasAccounts()).toBe(false)
    const mockEncrypted = JSON.stringify({
      version: 'webcrypto-v1',
      salt: 'abc',
      iv: 'def',
      ciphertext: 'ghi',
    })
    addToKeychain('testuser', mockEncrypted)
    expect(hasAccounts()).toBe(true)
  })
})
