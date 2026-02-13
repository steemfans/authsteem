/**
 * Thin wrapper around @steemit/steem-uri: decode, resolveTransaction, resolveCallback.
 * resolveTransaction uses steem-js getDynamicGlobalProperties for ref_block_* and expiration.
 */

import { Buffer } from 'buffer'
import { getDynamicGlobalProperties } from './steem'
import type { DecodeResult, ResolveResult, TransactionConfirmation } from '@steemit/steem-uri'

const EXPIRE_TIME_MS = (600 + 60) * 1000 // 600s + 60s like legacy

export type ParsedSteemUri = DecodeResult

/** Decode steem:// URI to { tx, params }. */
export async function decode(uri: string): Promise<ParsedSteemUri> {
  const steemUri = await import('@steemit/steem-uri')
  return steemUri.decode(uri)
}

/** Resolve decoded tx + params to a signable transaction (ref_block_*, expiration, signers). */
export async function resolveTransaction(
  parsed: ParsedSteemUri,
  signer: string
): Promise<Record<string, unknown> & { ref_block_num: number; ref_block_prefix: number; expiration: string }> {
  const props = await getDynamicGlobalProperties()
  const headBlockNumber = (props.head_block_number as number) ?? 0
  const headBlockId = (props.head_block_id as string) ?? '0000000000000000000000000000000000000000'

  const refBlockNum = headBlockNumber & 0xffff
  const refBlockPrefix = Buffer.from(headBlockId, 'hex').readUInt32LE(4)
  const expiration = new Date(Date.now() + EXPIRE_TIME_MS).toISOString().slice(0, -5)

  const steemUri = await import('@steemit/steem-uri')
  const resolved: ResolveResult = steemUri.resolveTransaction(parsed.tx, parsed.params, {
    ref_block_num: refBlockNum,
    ref_block_prefix: refBlockPrefix,
    expiration,
    signers: [signer],
    preferred_signer: signer,
  })

  const tx = resolved?.tx as unknown as Record<string, unknown>
  if (!tx) throw new Error('resolveTransaction returned no tx')

  return {
    ...tx,
    ref_block_num: typeof tx.ref_block_num === 'string' ? parseInt(tx.ref_block_num as string, 10) : (tx.ref_block_num as number),
    ref_block_prefix: typeof tx.ref_block_prefix === 'string' ? parseInt(tx.ref_block_prefix as string, 10) : (tx.ref_block_prefix as number),
    expiration: (tx.expiration as string) ?? expiration,
  }
}

/** Build callback URL with sig, id, block, txn (for Web redirect after sign). */
export async function resolveCallback(callbackUrl: string, ctx: TransactionConfirmation): Promise<string> {
  const steemUri = await import('@steemit/steem-uri')
  return steemUri.resolveCallback(callbackUrl, ctx)
}

/** Encode operations array to steem URI (for DevTools / broadcast-op). */
export async function encodeOps(
  ops: [string, Record<string, unknown>][],
  params?: Record<string, unknown>,
  protocol: 'steem' | 'web+steem' | 'ext+steem' = 'web+steem'
): Promise<string> {
  const steemUri = await import('@steemit/steem-uri')
  return steemUri.encodeOps(ops as never, params ?? {}, protocol)
}
