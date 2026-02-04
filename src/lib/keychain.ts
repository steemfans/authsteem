/**
 * Keychain storage (localStorage). Same key as legacy for compatibility.
 * Encryption/decryption uses Web Crypto API (see keychain-crypto.ts).
 */

export const KEYCHAIN_LOCALSTORAGE_KEY = 'keychain'

export interface KeychainRecord {
  [username: string]: string
}

export function getKeychain(): KeychainRecord {
  const stored = localStorage.getItem(KEYCHAIN_LOCALSTORAGE_KEY)
  if (!stored) return {}
  try {
    return JSON.parse(stored) as KeychainRecord
  } catch {
    return {}
  }
}

export function hasAccounts(): boolean {
  return Object.keys(getKeychain()).length > 0
}

export function addToKeychain(username: string, encryptedPayload: string): void {
  const keychain = getKeychain()
  keychain[username] = encryptedPayload
  localStorage.setItem(KEYCHAIN_LOCALSTORAGE_KEY, JSON.stringify(keychain))
}

export function removeFromKeychain(username: string): void {
  const keychain = getKeychain()
  delete keychain[username]
  localStorage.setItem(KEYCHAIN_LOCALSTORAGE_KEY, JSON.stringify(keychain))
}
