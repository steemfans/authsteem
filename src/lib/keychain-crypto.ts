/**
 * Keychain encryption/decryption using Web Crypto API (PBKDF2 + AES-GCM).
 * Uses modern browser-native cryptography for secure key storage.
 */

export interface KeysPayload {
  owner: string | null
  active: string | null
  posting: string | null
  memo: string | null
}

interface EncryptedPayload {
  version: 'webcrypto-v1'
  salt: string // hex
  iv: string // hex
  ciphertext: string // hex
}

const PBKDF2_ITERATIONS = 100000
const KEY_LENGTH = 256 // bits
const IV_LENGTH = 12 // bytes for AES-GCM

/**
 * Derive encryption key from password using PBKDF2.
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  // Ensure salt is ArrayBuffer (not SharedArrayBuffer) by creating a new copy
  const saltBuffer = salt.buffer.slice(0) as ArrayBuffer

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Convert hex string to Uint8Array.
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

/**
 * Convert Uint8Array to hex string.
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Encrypt keys JSON with keychain password using Web Crypto API.
 * Returns JSON string with version, salt, iv, ciphertext.
 */
export async function encryptKeys(keys: KeysPayload, keychainPassword: string): Promise<string> {
  const data = new TextEncoder().encode(JSON.stringify(keys))
  const saltArray = crypto.getRandomValues(new Uint8Array(16))
  const ivArray = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

  const key = await deriveKey(keychainPassword, saltArray)
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivArray,
    },
    key,
    data
  )

  const payload: EncryptedPayload = {
    version: 'webcrypto-v1',
    salt: bytesToHex(saltArray),
    iv: bytesToHex(ivArray),
    ciphertext: bytesToHex(new Uint8Array(ciphertext)),
  }

  return JSON.stringify(payload)
}

/**
 * Decrypt payload with keychain password using Web Crypto API.
 * Only supports Web Crypto format (webcrypto-v1).
 */
export async function decryptKeys(
  encryptedPayload: string,
  keychainPassword: string
): Promise<KeysPayload> {
  try {
    const payload = JSON.parse(encryptedPayload) as EncryptedPayload
    if (payload.version !== 'webcrypto-v1' || !payload.salt || !payload.iv || !payload.ciphertext) {
      throw new Error('Invalid payload format: expected webcrypto-v1')
    }

    const saltArray = hexToBytes(payload.salt)
    const ivArray = hexToBytes(payload.iv)
    const ciphertextArray = hexToBytes(payload.ciphertext)

    const key = await deriveKey(keychainPassword, saltArray)
    // Create a new ArrayBuffer copy to ensure it's not SharedArrayBuffer
    const ciphertextBuffer = new ArrayBuffer(ciphertextArray.length)
    new Uint8Array(ciphertextBuffer).set(ciphertextArray)
    // Ensure iv is a new Uint8Array with ArrayBuffer (not SharedArrayBuffer)
    const ivBuffer = new ArrayBuffer(ivArray.length)
    const ivView = new Uint8Array(ivBuffer)
    ivView.set(ivArray)
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivView,
      },
      key,
      ciphertextBuffer
    )

    const raw = JSON.parse(new TextDecoder().decode(decrypted)) as Partial<KeysPayload>
    return {
      owner: raw.owner ?? null,
      active: raw.active ?? null,
      posting: raw.posting ?? null,
      memo: raw.memo ?? null,
    }
  } catch (err) {
    throw new Error(`Decryption failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
}

/**
 * Check if encrypted payload is Web Crypto format.
 */
export function isWebCryptoFormat(encryptedPayload: string): boolean {
  try {
    const payload = JSON.parse(encryptedPayload)
    return payload?.version === 'webcrypto-v1' && payload?.salt && payload?.iv && payload?.ciphertext
  } catch {
    return false
  }
}
