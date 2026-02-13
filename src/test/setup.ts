import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock window.crypto for Web Crypto API
const mockCrypto = {
  subtle: {
    importKey: vi.fn().mockResolvedValue({}),
    deriveKey: vi.fn().mockResolvedValue({}),
    encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
    decrypt: vi.fn().mockImplementation(async () => {
      // Return encrypted JSON for decryptKeys test
      const data = new TextEncoder().encode(JSON.stringify({ active: '5J...', posting: '5J...', memo: null }))
      return data.buffer
    }),
  },
  getRandomValues: vi.fn().mockImplementation((arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
    return arr
  }),
}

Object.defineProperty(window, 'crypto', {
  value: mockCrypto,
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Reset localStorage before each test
beforeEach(() => {
  localStorageMock.clear()
})
