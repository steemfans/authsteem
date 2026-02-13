import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/i18n'

export function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="max-w-md mx-auto text-center">
      <Card>
        <CardHeader>
          <CardTitle>{t('notFound.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">{t('notFound.description')}</p>
          <Button asChild>
            <Link to="/">{t('common.backToHome')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
