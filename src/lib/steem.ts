/**
 * Steem RPC and auth wrapper using @steemit/steem-js (next).
 * Provides: node URL, condenser get_accounts, getConfig, getDynamicGlobalProperties, sign, broadcast.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SteemApi = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SteemAuth = any

interface SteemLib {
  api: SteemApi
  auth: SteemAuth
  config: {
    set: (options: Record<string, unknown>) => void
    get: (key: string) => unknown
    getString: (key: string) => string
    all: () => Record<string, unknown>
  }
}

let steem: SteemLib | null = null

async function getSteem(): Promise<SteemLib> {
  if (steem) return steem
  const mod = await import('@steemit/steem-js')
  steem = mod.steem as SteemLib
  return steem
}

/** Set RPC node URL (updates api and config). */
export async function setNodeUrl(url: string): Promise<void> {
  const s = await getSteem()
  s.config.set({ nodes: [url] })
}

/** Get accounts via condenser_api.get_accounts (returns memo_key, owner/active/posting key_auths). */
export async function getAccountsCondenser(names: string[]): Promise<unknown[]> {
  const s = await getSteem()
  const result = await s.api.callAsync('condenser_api.get_accounts', [names])
  return Array.isArray(result) ? result : []
}

/** Get dynamic global properties (head_block_number, head_block_id, etc.). */
export async function getDynamicGlobalProperties(): Promise<Record<string, unknown>> {
  const s = await getSteem()
  const result = await (s.api as { getDynamicGlobalPropertiesAsync?: () => Promise<unknown> }).getDynamicGlobalPropertiesAsync?.()
  return (result as Record<string, unknown>) ?? {}
}

/** Get chain config (STEEM_CHAIN_ID, STEEM_ADDRESS_PREFIX, etc.). */
export async function getConfig(): Promise<Record<string, unknown>> {
  const s = await getSteem()
  const result = await (s.api as { getConfigAsync?: () => Promise<unknown> }).getConfigAsync?.()
  return (result as Record<string, unknown>) ?? {}
}

/** Sign transaction with WIF keys. Returns signed transaction object. */
export async function signTransaction(trx: unknown, keys: string[]): Promise<unknown> {
  const s = await getSteem()
  return s.auth.signTransaction(trx, keys)
}

/** Broadcast already-signed transaction. */
export async function broadcastTransaction(signedTx: unknown): Promise<unknown> {
  const s = await getSteem()
  return (s.api as { broadcastTransactionAsync?: (tx: unknown) => Promise<unknown> }).broadcastTransactionAsync?.(signedTx)
}

/** Get steem api singleton for direct use (e.g. getBlockAsync). */
export async function getApi(): Promise<SteemApi> {
  const s = await getSteem()
  return s.api
}

/** Get steem auth for direct use. */
export async function getAuth(): Promise<SteemAuth> {
  const s = await getSteem()
  return s.auth
}
