import { sanitizeAuthority } from './sign-path'

export type SigningAuthority = 'owner' | 'active' | 'posting' | 'memo'

const AUTHORITY_RANK: Record<SigningAuthority, number> = {
  memo: 0,
  posting: 1,
  active: 2,
  owner: 3,
}

/** Operations that always require owner key when present in a transaction. */
const OWNER_REQUIRED_OPS = new Set([
  'account_create',
  'account_create_with_delegation',
  'claim_account',
  'change_recovery_account',
  'request_account_recovery',
  'recover_account',
  'reset_account',
])

function isPresentAuthorityField(value: unknown): boolean {
  if (value == null || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') {
    const auth = value as { key_auths?: unknown[]; account_auths?: unknown[] }
    const keyAuths = auth.key_auths
    const accountAuths = auth.account_auths
    if (Array.isArray(keyAuths) && keyAuths.length > 0) return true
    if (Array.isArray(accountAuths) && accountAuths.length > 0) return true
  }
  return true
}

function authorityForOperation(type: string, payload: unknown): SigningAuthority | null {
  if (OWNER_REQUIRED_OPS.has(type)) return 'owner'

  if (type === 'account_update' && payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const data = payload as Record<string, unknown>
    if (isPresentAuthorityField(data.owner)) return 'owner'
    return 'active'
  }

  if (type === 'custom_json' && payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const data = payload as {
      required_auths?: unknown[]
      required_posting_auths?: unknown[]
    }
    const reqAuths = data.required_auths
    const reqPosting = data.required_posting_auths
    if (Array.isArray(reqAuths) && reqAuths.length > 0) return 'active'
    if (Array.isArray(reqPosting) && reqPosting.length > 0) return 'posting'
  }

  return null
}

function maxAuthority(a: SigningAuthority, b: SigningAuthority): SigningAuthority {
  return AUTHORITY_RANK[a] >= AUTHORITY_RANK[b] ? a : b
}

/**
 * Pick the Steem key role required to sign a transaction.
 * Operation requirements override a weaker `authority` query param (e.g. active → owner).
 */
export function resolveSigningAuthority(
  operations: unknown[],
  preferred?: string | null
): SigningAuthority {
  let required: SigningAuthority = 'active'

  if (Array.isArray(operations)) {
    for (const op of operations) {
      if (!Array.isArray(op) || op.length !== 2) continue
      const [type, payload] = op
      if (typeof type !== 'string') continue
      const opAuthority = authorityForOperation(type, payload)
      if (opAuthority) required = maxAuthority(required, opAuthority)
    }
  }

  const preferredSafe = sanitizeAuthority(preferred ?? undefined, 'active') as SigningAuthority
  if (AUTHORITY_RANK[required] > AUTHORITY_RANK[preferredSafe]) {
    return required
  }
  return preferredSafe
}
