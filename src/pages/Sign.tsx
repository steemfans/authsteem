import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { decode, resolveTransaction, resolveCallback, type ParsedSteemUri } from '@/lib/steem-uri'
import { broadcastTransaction } from '@/lib/steem'
import { useAuthStore } from '@/stores/auth'
import { getAuthority } from '@/lib/auth'
import type { KeysMap } from '@/lib/auth'

export function Sign() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const pathMatch = params['*'] ?? ''
  const username = useAuthStore((s) => s.username)
  const keys = useAuthStore((s) => s.keys)
  const signTx = useAuthStore((s) => s.signTx)
  const authority = getAuthority(searchParams.get('authority') ?? undefined, 'active')
  const [parsed, setParsed] = useState<ParsedSteemUri | null>(null)
  const [uriValid, setUriValid] = useState(true)
  const [loading, setLoading] = useState(false)
  const [txId, setTxId] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uri = `steem://sign/${pathMatch}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

  useEffect(() => {
    let cancelled = false
    decode(uri)
      .then((p) => {
        if (!cancelled) {
          setParsed(p)
          setUriValid(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setParsed(null)
          setUriValid(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [uri])

  const hasRequiredKey = username && ((keys as KeysMap)[authority as keyof KeysMap] ?? keys.active)

  async function handleApprove() {
    if (!parsed || !username) return
    setLoading(true)
    setFailed(false)
    setError(null)
    setTxId(null)
    try {
      const tx = await resolveTransaction(parsed, username)
      const signedTx = await signTx(tx, authority)
      const result = await broadcastTransaction(signedTx) as { id?: string; block_num?: number; txn_num?: number }
      setTxId(result?.id ?? null)
      setFailed(false)
      const callbackUrl = parsed.params?.callback as string | undefined
      if (callbackUrl && typeof callbackUrl === 'string') {
        const sig = (signedTx as { signatures?: string[] })?.signatures?.[0] ?? ''
        const redirectUrl = await resolveCallback(callbackUrl, {
          sig,
          id: result?.id,
          block: result?.block_num,
          txn: result?.txn_num,
        })
        window.location.href = redirectUrl
        return
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setFailed(true)
    }
    setLoading(false)
  }

  function handleReject() {
    navigate('/')
  }

  if (!uriValid || !parsed) {
    return (
      <div>
        <h1>Confirm transaction</h1>
        <p style={{ color: 'red' }}>Invalid signing URL.</p>
        <button type="button" onClick={() => navigate('/')}>
          Back
        </button>
      </div>
    )
  }

  if (txId && !failed) {
    return (
      <div>
        <h1>Transaction broadcast</h1>
        <p>Transaction ID: {txId}</p>
        <button type="button" onClick={() => navigate('/')}>
          Done
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1>Confirm transaction {authority ? `(${authority})` : ''}</h1>
      {parsed?.tx && (
        <pre style={{ fontSize: 12, overflow: 'auto', maxHeight: 300 }}>
          {JSON.stringify(parsed.tx, null, 2)}
        </pre>
      )}
      {!username || !hasRequiredKey ? (
        <p>
          <Link to={`/login?redirect=${encodeURIComponent(uri)}&authority=${authority}`}>
            Continue to login
          </Link>
        </p>
      ) : (
        <>
          {parsed.params?.callback && (
            <p>You will be redirected after signing.</p>
          )}
          {error != null && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={handleApprove} disabled={loading}>
              {parsed.params?.no_broadcast ? 'Sign' : 'Approve'}
            </button>
            <button type="button" onClick={handleReject}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  )
}
