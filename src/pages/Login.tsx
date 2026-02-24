import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { getKeychain } from '@/lib/keychain'
import { decryptKeys } from '@/lib/keychain-helpers'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from '@/i18n'
import { sanitizeRedirectPath, sanitizeAuthority } from '@/lib/sign-path'

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore((s) => s.login)
  const redirectParam = searchParams.get('redirect')
  const [username, setUsername] = useState('')
  const [keychainPassword, setKeychainPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [keychain, setKeychain] = useState<Record<string, string>>({})

  useEffect(() => {
    setKeychain(getKeychain())
    const usernames = Object.keys(getKeychain())
    if (usernames.length > 0 && !username) setUsername(usernames[0])
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!username || !keychainPassword) {
      setError(t('login.errorRequired'))
      return
    }
    const encrypted = keychain[username]
    if (!encrypted) {
      setError(t('login.errorNotFound'))
      return
    }
    setLoading(true)
    try {
      const keys = await decryptKeys(encrypted, keychainPassword)
      await login(username, keys)
      // Return to sign page only if redirect is a valid, safe sign path (no path traversal / injection)
      const pathPart = redirectParam ? sanitizeRedirectPath(redirectParam) : null
      const authority = sanitizeAuthority(searchParams.get('authority'), 'active')
      if (pathPart !== null) {
        navigate(`/sign/${pathPart}${authority !== 'active' ? `?authority=${authority}` : ''}`)
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(t('login.errorInvalid'))
    }
    setLoading(false)
  }

  const keychainUsers = Object.keys(keychain)

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
      <div>
        <div className="leading-none font-semibold">{t('login.title')}</div>
        <p className="text-muted-foreground text-sm mt-2">{t('login.description')}</p>
      </div>
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('login.usernameLabel')}</Label>
              <Select value={username} onValueChange={setUsername}>
                <SelectTrigger id="username">
                  <SelectValue placeholder={t('login.usernamePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {keychainUsers.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="keychain-password">{t('login.passwordLabel')}</Label>
              <Input
                id="keychain-password"
                type="password"
                value={keychainPassword}
                onChange={(e) => setKeychainPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t('login.loggingIn') : t('common.login')}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/import" className="underline">
              {t('common.import')}
            </Link>
          </p>
      </div>
      <p className="mt-4 text-center text-sm">
        <Link to="/" className="text-muted-foreground hover:underline">
          {t('common.backToHome')}
        </Link>
      </p>
    </div>
  )
}
