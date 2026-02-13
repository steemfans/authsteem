import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n'

export function Home() {
  const { t } = useTranslation()
  const username = useAuthStore((s) => s.username)

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('home.title')}</CardTitle>
          <CardDescription>{t('home.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {username ? (
            <>
              <p className="text-sm">
                {t('home.loggedInAs', { username })}
              </p>
              <Button asChild variant="default">
                <Link to="/dashboard">{t('home.goToDashboard')}</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{t('home.importOrLogin')}</p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link to="/import">{t('common.import')}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/login">{t('common.login')}</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
