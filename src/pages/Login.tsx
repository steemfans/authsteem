import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { KeychainLoginForm } from '@/components/KeychainLoginForm'
import { useTranslation } from '@/i18n'
import { buildSignReturnPath, sanitizeAuthority } from '@/lib/sign-path'

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectParam = searchParams.get('redirect')
  const authority = sanitizeAuthority(searchParams.get('authority'), 'active')

  function handleSuccess() {
    const returnPath = buildSignReturnPath(redirectParam, authority)
    navigate(returnPath ?? '/dashboard')
  }

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
      <div>
        <div className="leading-none font-semibold">{t('login.title')}</div>
        <p className="text-muted-foreground text-sm mt-2">{t('login.description')}</p>
      </div>
      <KeychainLoginForm onSuccess={handleSuccess} />
      <p className="mt-4 text-center text-sm">
        <Link to="/" className="text-muted-foreground hover:underline">
          {t('common.backToHome')}
        </Link>
      </p>
    </div>
  )
}
