import { Link } from 'react-router-dom'
import { useTranslation } from '@/i18n'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function DevTools() {
  const { t } = useTranslation()

  return (
    <div className="max-w-2xl mx-auto w-full p-4 flex flex-col gap-6">
      <div>
        <h2 className="leading-none font-semibold">{t('devTools.indexTitle')}</h2>
        <p className="text-muted-foreground text-sm mt-2">{t('devTools.indexDescription')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>{t('broadcastOp.title')}</CardTitle>
            <CardDescription>{t('broadcastOp.description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-end">
            <Button asChild variant="secondary" className="w-full">
              <Link to="/dev-tools/broadcast-op">{t('devTools.open')}</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>{t('steemUriTest.title')}</CardTitle>
            <CardDescription>{t('steemUriTest.description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-end">
            <Button asChild variant="secondary" className="w-full">
              <Link to="/dev-tools/steem-uri-test">{t('devTools.open')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link to="/" className="underline">
          {t('common.backToHome')}
        </Link>
      </p>
    </div>
  )
}
