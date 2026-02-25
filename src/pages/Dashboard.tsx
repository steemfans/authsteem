import { useState, useRef } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useTranslation } from '@/i18n'
import { CheckCircle, XCircle } from 'lucide-react'
import { decode, resolveTransaction } from '@/lib/steem-uri'
import { broadcastTransaction } from '@/lib/steem'
import { Button } from '@/components/ui/button'

function parseAssetAmount(value: unknown): { amount: number; symbol: string } | null {
  if (typeof value !== 'string') return null
  const m = value.trim().match(/^(-?\d+(?:\.\d+)?)\s+([A-Z]+)$/)
  if (!m) return null
  return { amount: Number(m[1]), symbol: m[2] }
}

function formatNumber(n: number, digits = 3): string {
  if (!Number.isFinite(n)) return '-'
  return n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

type Authority = {
  weight_threshold?: number
  account_auths?: [string, number][]
  key_auths?: [string, number][]
}

function AuthorityTable({
  title,
  auth,
}: {
  title: string
  auth: Authority | null
}) {
  const threshold = auth?.weight_threshold ?? null
  const accountAuths = auth?.account_auths ?? []
  const keyAuths = auth?.key_auths ?? []

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="px-3 py-2 bg-muted/50 border-b">
        <div className="text-sm font-medium">{title}</div>
      </div>
      <div className="px-3 py-2">
        <table className="w-full text-sm border-collapse">
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 align-top w-[1%] whitespace-nowrap text-xs font-medium text-muted-foreground">
                threshold
              </td>
              <td className="py-2 align-top text-foreground">{threshold ?? '-'}</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 align-top w-[1%] whitespace-nowrap text-xs font-medium text-muted-foreground">
                account_auths
              </td>
              <td className="py-2 align-top text-foreground">
                {accountAuths.length === 0 ? (
                  <span className="text-muted-foreground">-</span>
                ) : (
                  <div className="space-y-1">
                    {accountAuths.map(([name, weight]) => (
                      <div key={`${name}:${weight}`} className="flex items-baseline justify-between gap-3">
                        <span className="font-mono text-xs">{name}</span>
                        <span className="text-xs text-muted-foreground">{weight}</span>
                      </div>
                    ))}
                  </div>
                )}
              </td>
            </tr>
            <tr className="last:border-b-0">
              <td className="py-2 pr-4 align-top w-[1%] whitespace-nowrap text-xs font-medium text-muted-foreground">
                key_auths
              </td>
              <td className="py-2 align-top text-foreground">
                {keyAuths.length === 0 ? (
                  <span className="text-muted-foreground">-</span>
                ) : (
                  <div className="space-y-1">
                    {keyAuths.map(([pub, weight]) => (
                      <div key={`${pub}:${weight}`} className="flex items-baseline justify-between gap-3">
                        <span className="font-mono text-xs break-all">{pub}</span>
                        <span className="text-xs text-muted-foreground">{weight}</span>
                      </div>
                    ))}
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

type TabId = 'user' | 'sign'

export function Dashboard() {
  const { t } = useTranslation()
  const username = useAuthStore((s) => s.username)
  const account = useAuthStore((s) => s.account)
  const signTx = useAuthStore((s) => s.signTx)
  const properties = useSettingsStore((s) => s.properties) as Record<string, unknown>

  const [tab, setTab] = useState<TabId>('user')
  const [uriText, setUriText] = useState('')
  const [signLoading, setSignLoading] = useState(false)
  const [signError, setSignError] = useState<string | null>(null)
  const [txId, setTxId] = useState<string | null>(null)
  const [blockNum, setBlockNum] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const vestsFund = parseAssetAmount(properties.total_vesting_fund_steem)?.amount ?? null
  const vestsShares = parseAssetAmount(properties.total_vesting_shares)?.amount ?? null
  const vestsToSP = vestsFund && vestsShares ? vestsFund / vestsShares : null

  const steemBalance = (account as Record<string, unknown> | null)?.balance
  const sbdBalance = (account as Record<string, unknown> | null)?.sbd_balance
  const vestingShares = (account as Record<string, unknown> | null)?.vesting_shares
  const vesting = parseAssetAmount(vestingShares)?.amount ?? null
  const sp = vestingToSp(vesting, vestsToSP)

  const ownerAuth = ((account as Record<string, unknown> | null)?.owner ?? null) as Authority | null
  const activeAuth = ((account as Record<string, unknown> | null)?.active ?? null) as Authority | null
  const postingAuth = ((account as Record<string, unknown> | null)?.posting ?? null) as Authority | null

  const recoveryAccount = ((account as Record<string, unknown> | null)?.recovery_account as string | undefined) ?? null
  const created = ((account as Record<string, unknown> | null)?.created as string | undefined) ?? null
  const lastAccountRecovery = ((account as Record<string, unknown> | null)?.last_account_recovery as string | undefined) ?? null
  const lastOwnerUpdate = ((account as Record<string, unknown> | null)?.last_owner_update as string | undefined) ?? null

  async function handlePaste() {
    setUriText('')
    try {
      const text = await navigator.clipboard.readText()
      setUriText(text)
      textareaRef.current?.focus()
    } catch {
      setSignError('Failed to read clipboard')
    }
  }

  async function handleSignAndBroadcast() {
    const uri = uriText.trim()
    if (!uri || !username) return
    setSignLoading(true)
    setSignError(null)
    setTxId(null)
    setBlockNum(null)
    try {
      const parsed = await decode(uri)
      const tx = await resolveTransaction(parsed, username)
      const signedTx = await signTx(tx, 'active')
      const result = await broadcastTransaction(signedTx)
      setTxId(result?.id ?? null)
      setBlockNum(result?.block_num ?? null)
    } catch (e) {
      setSignError(e instanceof Error ? e.message : String(e))
    }
    setSignLoading(false)
  }

  function handleSignAgain() {
    setTxId(null)
    setBlockNum(null)
    setSignError(null)
    setUriText('')
  }

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
      <div>
        <div className="leading-none font-semibold">{t('dashboard.title')}</div>
        <p className="text-muted-foreground text-sm mt-2">{t('dashboard.welcome', { username: username ?? '' })}</p>
      </div>

      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setTab('user')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === 'user' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          {t('dashboard.tabUserInfo')}
        </button>
        <button
          type="button"
          onClick={() => setTab('sign')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === 'sign' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          {t('dashboard.tabSignData')}
        </button>
      </div>

      {tab === 'user' && (
        !account ? (
          <div className="text-sm text-muted-foreground">{t('common.loading')}</div>
        ) : (
          <div className="space-y-6">
          <div className="border rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-muted/50 border-b">
              <div className="text-sm font-medium">Balances</div>
            </div>
            <div className="px-3 py-2">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4 align-top w-[1%] whitespace-nowrap text-xs font-medium text-muted-foreground">
                      STEEM
                    </td>
                    <td className="py-2 align-top text-foreground">{typeof steemBalance === 'string' ? steemBalance : '-'}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4 align-top w-[1%] whitespace-nowrap text-xs font-medium text-muted-foreground">
                      SBD
                    </td>
                    <td className="py-2 align-top text-foreground">{typeof sbdBalance === 'string' ? sbdBalance : '-'}</td>
                  </tr>
                  <tr className="last:border-b-0">
                    <td className="py-2 pr-4 align-top w-[1%] whitespace-nowrap text-xs font-medium text-muted-foreground">
                      SP
                    </td>
                    <td className="py-2 align-top text-foreground">
                      {sp === null ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        `${formatNumber(sp, 3)} SP`
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
              {typeof vestingShares === 'string' && vestingShares ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  vesting_shares: <span className="font-mono">{vestingShares}</span>
                </p>
              ) : null}
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-muted/50 border-b">
              <div className="text-sm font-medium">Account</div>
            </div>
            <div className="px-3 py-2">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4 align-top w-[1%] whitespace-nowrap text-xs font-medium text-muted-foreground">
                      recovery_account
                    </td>
                    <td className="py-2 align-top text-foreground">{recoveryAccount ?? '-'}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4 align-top w-[1%] whitespace-nowrap text-xs font-medium text-muted-foreground">
                      created
                    </td>
                    <td className="py-2 align-top text-foreground">{created ?? '-'}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4 align-top w-[1%] whitespace-nowrap text-xs font-medium text-muted-foreground">
                      last_account_recovery
                    </td>
                    <td className="py-2 align-top text-foreground">{lastAccountRecovery ?? '-'}</td>
                  </tr>
                  <tr className="last:border-b-0">
                    <td className="py-2 pr-4 align-top w-[1%] whitespace-nowrap text-xs font-medium text-muted-foreground">
                      last_owner_update
                    </td>
                    <td className="py-2 align-top text-foreground">{lastOwnerUpdate ?? '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <AuthorityTable title="Owner authority" auth={ownerAuth} />
            <AuthorityTable title="Active authority" auth={activeAuth} />
            <AuthorityTable title="Posting authority" auth={postingAuth} />
          </div>
        </div>
        )
      )}

      {tab === 'sign' && (
        <div className="space-y-4">
          {txId ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-muted/50 border-b">
                <div className="text-sm font-medium">{t('dashboard.signResultTitle')}</div>
              </div>
              <div className="px-3 py-4 space-y-4">
                <div className="flex items-center justify-center">
                  <CheckCircle className="size-16 text-green-600 dark:text-green-400" aria-hidden />
                </div>
                <p className="text-sm break-all">{t('sign.txId', { id: txId })}</p>
                {blockNum != null && (
                  <p className="text-sm text-muted-foreground">{t('sign.blockNum', { block: blockNum })}</p>
                )}
                <Button type="button" variant="outline" onClick={handleSignAgain}>
                  {t('dashboard.signAgain')}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {signError && (
                <div className="flex items-start gap-3 p-3 rounded-lg border border-destructive/50 bg-destructive/10">
                  <XCircle className="size-8 shrink-0 text-destructive" aria-hidden />
                  <p className="text-sm text-destructive">{signError}</p>
                </div>
              )}
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={uriText}
                    onChange={(e) => setUriText(e.target.value)}
                    placeholder={t('dashboard.signPlaceholder')}
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 pr-20 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    rows={6}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePaste}
                    className="absolute bottom-2 right-2"
                  >
                    {t('dashboard.paste')}
                  </Button>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSignAndBroadcast}
                    disabled={signLoading || !uriText.trim() || !username}
                  >
                    {signLoading ? t('common.loading') : t('dashboard.signAndBroadcast')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function vestingToSp(vesting: number | null, ratio: number | null): number | null {
  if (vesting === null || ratio === null) return null
  if (!Number.isFinite(vesting) || !Number.isFinite(ratio)) return null
  return vesting * ratio
}
