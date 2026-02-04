/**
 * Auth store: username, keys (WIF), account. Login uses credentialsValid + getAccountsCondenser.
 */

import { create } from 'zustand'
import { credentialsValid, type KeysMap } from '@/lib/auth'
import { getAccountsCondenser } from '@/lib/steem'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AccountInfo = Record<string, any>

interface AuthState {
  username: string | null
  keys: KeysMap
  account: AccountInfo | null
  login: (username: string, keys: KeysMap) => Promise<void>
  logout: () => void
  loadAccount: () => Promise<void>
  /** Sign tx with given authority (active | posting | memo); returns signed tx. */
  signTx: (tx: unknown, authority: string) => Promise<unknown>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  username: null,
  keys: { active: null, posting: null, memo: null },
  account: null,

  login: async (username, keys) => {
    const key = keys.active ?? keys.posting ?? keys.memo
    if (!key) throw new Error('No key')
    const valid = await credentialsValid(username, key)
    if (!valid) throw new Error('Invalid credentials')
    const accounts = await getAccountsCondenser([username])
    const account = (accounts[0] ?? null) as AccountInfo | null
    set({ username, keys, account })
  },

  logout: () => {
    set({ username: null, keys: { active: null, posting: null, memo: null }, account: null })
  },

  loadAccount: async () => {
    const { username } = get()
    if (!username) return
    const accounts = await getAccountsCondenser([username])
    set({ account: (accounts[0] ?? null) as AccountInfo | null })
  },

  signTx: async (tx, authority) => {
    const { keys } = get()
    const wif = (authority && keys[authority as keyof KeysMap]) ?? keys.active ?? keys.posting ?? keys.memo
    if (!wif) throw new Error('No key for authority')
    const { signTransaction } = await import('@/lib/steem')
    return signTransaction(tx, [wif])
  },
}))
