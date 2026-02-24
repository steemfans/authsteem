import { useAuthStore } from '@/stores/auth'
import { useTranslation } from '@/i18n'

export function Dashboard() {
  const { t } = useTranslation()
  const username = useAuthStore((s) => s.username)
  const account = useAuthStore((s) => s.account)

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
      <div>
        <div className="leading-none font-semibold">{t('dashboard.title')}</div>
        <p className="text-muted-foreground text-sm mt-2">{t('dashboard.welcome', { username: username ?? '' })}</p>
      </div>
      <div>
        {account && (
          <pre className="text-xs overflow-auto max-h-[300px] p-3 rounded-md bg-muted">
            {JSON.stringify(account, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
