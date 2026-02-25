import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { decode, resolveTransaction, resolveCallback, type ParsedSteemUri } from '@/lib/steem-uri'
import { isValidSignPath } from '@/lib/sign-path'
import { broadcastTransaction } from '@/lib/steem'
import { useAuthStore } from '@/stores/auth'
import { getAuthority } from '@/lib/auth'
import type { KeysMap } from '@/lib/auth'
import { CheckCircle, XCircle } from 'lucide-react'
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
  const [blockNum, setBlockNum] = useState<number | null>(null)
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
    setBlockNum(null)
    try {
      const tx = await resolveTransaction(parsed, username)
      const signedTx = await signTx(tx, authority)
      const result = await broadcastTransaction(signedTx)
      setTxId(result?.id ?? null)
      setBlockNum(result?.block_num ?? null)
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
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <CheckCircle className="size-16 text-green-600 dark:text-green-400" aria-hidden />
          </div>
          <p className="text-sm break-all">{t('sign.txId', { id: txId })}</p>
          {blockNum != null && (
            <p className="text-sm text-muted-foreground">{t('sign.blockNum', { block: blockNum })}</p>
          )}
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
          <div className="flex gap-2 flex-wrap">
            <Button asChild variant="default">
              <Link to={`/login?redirect=${encodeURIComponent(uri)}&authority=${authority}`}>
                {t('sign.continueToLogin')}
              </Link>
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              {t('common.back')}
            </Button>
          </div>
        ) : (
          <>
            {parsed.params?.callback && (
              <p className="text-sm text-muted-foreground">{t('sign.callbackNotice')}</p>
            )}
            {failed && error != null && (
              <div className="flex items-start gap-3 p-3 rounded-lg border border-destructive/50 bg-destructive/10">
                <XCircle className="size-8 shrink-0 text-destructive" aria-hidden />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
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
