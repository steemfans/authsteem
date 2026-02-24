import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { decode, resolveTransaction, resolveCallback, type ParsedSteemUri } from '@/lib/steem-uri'
import { isValidSignPath } from '@/lib/sign-path'
import { broadcastTransaction } from '@/lib/steem'
import { useAuthStore } from '@/stores/auth'
import { getAuthority } from '@/lib/auth'
import type { KeysMap } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { OperationItem } from '@/components/Operation'
import { useTranslation } from '@/i18n'

export function Sign() {
  const { t } = useTranslation()
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

  const pathSafe = isValidSignPath(pathMatch)
  const uri = pathSafe
    ? `steem://sign/${pathMatch}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    : ''

  useEffect(() => {
    if (!pathSafe || !uri) {
      setParsed(null)
      setUriValid(false)
      return
    }
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
  }, [uri, pathSafe])

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
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
        <div className="leading-none font-semibold">{t('sign.title')}</div>
        <div className="space-y-3">
          <p className="text-destructive">{t('sign.invalidUrl')}</p>
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            {t('common.backToHome')}
          </Button>
        </div>
      </div>
    )
  }

  if (txId && !failed) {
    return (
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
        <div className="leading-none font-semibold">{t('sign.broadcastTitle')}</div>
        <div className="space-y-3">
          <p className="text-sm break-all">{t('sign.txId', { id: txId })}</p>
          <Button type="button" onClick={() => navigate('/')}>
            {t('common.done')}
          </Button>
        </div>
      </div>
    )
  }

  const title = authority
    ? t('sign.titleWithAuthority', { authority })
    : t('sign.title')

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
      <div className="leading-none font-semibold">{title}</div>
      <div className="space-y-4">
        {parsed?.tx?.operations && Array.isArray(parsed.tx.operations) && parsed.tx.operations.length > 0 ? (
          <div className="space-y-3">
            {parsed.tx.operations.map((op: [string, Record<string, unknown>], i: number) => (
              <OperationItem key={i} operation={op} />
            ))}
          </div>
        ) : parsed?.tx ? (
          <pre className="text-xs overflow-auto max-h-[300px] p-3 rounded-md bg-muted">
            {JSON.stringify(parsed.tx, null, 2)}
          </pre>
        ) : null}
        {!username || !hasRequiredKey ? (
          <Button asChild variant="default">
            <Link to={`/login?redirect=${encodeURIComponent(uri)}&authority=${authority}`}>
              {t('sign.continueToLogin')}
            </Link>
          </Button>
        ) : (
          <>
            {parsed.params?.callback && (
              <p className="text-sm text-muted-foreground">{t('sign.callbackNotice')}</p>
            )}
            {error != null && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" onClick={handleApprove} disabled={loading}>
                {parsed.params?.no_broadcast ? t('common.sign') : t('common.approve')}
              </Button>
              <Button type="button" variant="outline" onClick={handleReject}>
                {t('common.cancel')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
