import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { KeychainLoginForm } from '@/components/KeychainLoginForm'
import { SavedKeychainAccounts } from '@/components/SavedKeychainAccounts'
import { useTranslation } from '@/i18n'
import { buildSignReturnPath, sanitizeAuthority } from '@/lib/sign-path'

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [keychainRevision, setKeychainRevision] = useState(0)
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
      <div className="space-y-6">
        <KeychainLoginForm
          onSuccess={handleSuccess}
          keychainRevision={keychainRevision}
        />
        <SavedKeychainAccounts
          revision={keychainRevision}
          onAccountsChange={() => setKeychainRevision((n) => n + 1)}
        />
      </div>
      <p className="mt-4 text-center text-sm">
        <Link to="/" className="text-muted-foreground hover:underline">
          {t('common.backToHome')}
        </Link>
      </p>
    </div>
  )
}
