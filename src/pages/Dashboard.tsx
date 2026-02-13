import { useAuthStore } from '@/stores/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/i18n'

export function Dashboard() {
  const { t } = useTranslation()
  const username = useAuthStore((s) => s.username)
  const account = useAuthStore((s) => s.account)

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.title')}</CardTitle>
          <CardDescription>{t('dashboard.welcome', { username: username ?? '' })}</CardDescription>
        </CardHeader>
        <CardContent>
          {account && (
            <pre className="text-xs overflow-auto max-h-[300px] p-3 rounded-md bg-muted">
              {JSON.stringify(account, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
