/**
 * Auth helpers: credentialsValid, getKeys, getAuthority.
 * Uses @steemit/steem-js Auth + getAccountsCondenser (condenser_api format).
 */

import { getAccountsCondenser } from './steem'

// Account from condenser_api.get_accounts has memo_key, owner, active, posting with key_auths
interface CondenserAccount {
  memo_key?: string
  owner?: { key_auths: [string, number][] }
  active?: { key_auths: [string, number][] }
  posting?: { key_auths: [string, number][] }
}

export interface KeysMap {
  active: string | null
  posting: string | null
  memo: string | null
}

async function getSteemAuth(): Promise<{ isWif: (w: string) => boolean; wifToPublic: (w: string) => string; getPrivateKeys: (name: string, password: string, roles: string[]) => Record<string, string> }> {
  const mod = await import('@steemit/steem-js')
  return mod.steem.auth
}

/** Build map pubkey -> role (memo | active | posting | owner) from condenser account. */
function getUserKeysMap(account: CondenserAccount): Record<string, string> {
  const keys: Record<string, string> = {}
  if (account.memo_key) keys[account.memo_key] = 'memo'
  for (const role of ['owner', 'active', 'posting'] as const) {
    const auth = account[role]
    if (auth?.key_auths && Array.isArray(auth.key_auths)) {
      for (const [pubkey] of auth.key_auths) {
        keys[pubkey] = role
      }
    }
  }
  return keys
}

/** Validate username + password (password can be account password or WIF). */
export async function credentialsValid(username: string, password: string): Promise<boolean> {
  const accounts = await getAccountsCondenser([username])
  if (!accounts.length) return false
  const account = accounts[0] as CondenserAccount
  const keysMap = getUserKeysMap(account)
  const auth = await getSteemAuth()

  if (auth.isWif(password)) {
    const pubkey = auth.wifToPublic(password)
    return !!keysMap[pubkey]
  }
  const privKeys = auth.getPrivateKeys(username, password, ['active', 'posting', 'memo'])
  const activePub = privKeys.activePubkey ?? privKeys.active
  return !!(activePub && keysMap[activePub])
}

/** Get keys { active, posting, memo } - password can be account password or WIF. */
export async function getKeys(username: string, password: string): Promise<KeysMap> {
  const accounts = await getAccountsCondenser([username])
  const keys: KeysMap = { active: null, posting: null, memo: null }
  if (!accounts.length) return keys

  const account = accounts[0] as CondenserAccount
  const keysMap = getUserKeysMap(account)
  const auth = await getSteemAuth()

  if (auth.isWif(password)) {
    const pubkey = auth.wifToPublic(password)
    const type = keysMap[pubkey] as keyof KeysMap | undefined
    if (type && (type === 'active' || type === 'posting' || type === 'memo')) {
      keys[type] = password
    }
    return keys
  }

  const privKeys = auth.getPrivateKeys(username, password, ['active', 'posting', 'memo'])
  keys.active = privKeys.active ?? null
  keys.posting = privKeys.posting ?? null
  if (privKeys.memoPubkey && keysMap[privKeys.memoPubkey] === 'memo') {
    keys.memo = privKeys.memo ?? null
  }
  return keys
}

export function getAuthority(str: string | undefined, fallback: string): string {
  if (str && ['active', 'posting'].includes(str)) return str
  return fallback
}
