import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n'

export function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-6 text-center">
      <div className="leading-none font-semibold">{t('notFound.title')}</div>
      <div className="space-y-3">
        <p className="text-muted-foreground">{t('notFound.description')}</p>
        <Button asChild>
          <Link to="/">{t('common.backToHome')}</Link>
        </Button>
      </div>
    </div>
  )
}
