/**
 * Utilities for Operation display (VESTS→SP, formatting).
 */

import type { DynamicGlobalProperties } from '@/stores/settings'

const VESTS_REGEX = /[0-9]+(?:\.[0-9]{1,6})? VESTS/

export function getVestsToSP(properties: DynamicGlobalProperties): number {
  const fund = properties.total_vesting_fund_steem as string | undefined
  const shares = properties.total_vesting_shares as string | undefined
  if (!fund || !shares) return 0
  return parseFloat(fund) / parseFloat(shares)
}

export function formatAmount(
  value: string,
  vestsToSP: number
): string {
  if (VESTS_REGEX.test(value)) {
    const vests = parseFloat(value)
    return `${(vests * vestsToSP).toLocaleString(undefined, { maximumFractionDigits: 3 })} SP`
  }
  return value
}

export function formatTime(value: string | number): string {
  if (typeof value === 'number') {
    return new Date(value * 1000).toLocaleString()
  }
  const parsed = /^\d+$/.test(String(value)) ? parseInt(String(value), 10) * 1000 : Date.parse(String(value))
  if (Number.isNaN(parsed)) return String(value)
  return new Date(parsed).toLocaleString()
}
