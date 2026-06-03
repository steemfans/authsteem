import { useNavigate, Link } from 'react-router-dom'
import { ImportForm } from '@/components/ImportForm'
import { useTranslation } from '@/i18n'

export function Import() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
      <div>
        <div className="leading-none font-semibold">{t('import.title')}</div>
        <p className="text-muted-foreground text-sm mt-2">{t('import.description')}</p>
      </div>
      <ImportForm onSuccess={() => navigate('/dashboard')} />
      <p className="text-center text-sm text-muted-foreground">
        <Link to="/login" className="underline">
          {t('import.loginInstead')}
        </Link>
      </p>
      <p className="mt-4 text-center text-sm">
        <Link to="/" className="text-muted-foreground hover:underline">
          {t('common.backToHome')}
        </Link>
      </p>
    </div>
  )
}
