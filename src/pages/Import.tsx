import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { credentialsValid, getKeys, getAuthority } from '@/lib/auth'
import { addToKeychain } from '@/lib/keychain'
import { encryptKeys } from '@/lib/keychain-helpers'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslation } from '@/i18n'

export function Import() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [storeAccount, setStoreAccount] = useState(true)
  const [keychainPassword, setKeychainPassword] = useState('')
  const [keychainConfirm, setKeychainConfirm] = useState('')
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const authority = getAuthority(undefined, 'active')

  async function handleStep1() {
    setError('')
    if (!username.trim() || !password) {
      setError(t('import.errorRequired'))
      return
    }
    setLoading(true)
    try {
      const valid = await credentialsValid(username.trim(), password)
      if (!valid) {
        setError(t('import.errorInvalid'))
        setLoading(false)
        return
      }
      if (storeAccount) {
        setStep(2)
      } else {
        await doLogin(username.trim(), password)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('import.errorInvalid'))
    }
    setLoading(false)
  }

  async function doLogin(user: string, pwd: string) {
    const keys = await getKeys(user, pwd)
    if (authority && !keys[authority as keyof typeof keys]) {
      setError(t('import.errorAuthority', { authority }))
      return
    }
    await login(user, keys)
    navigate('/')
  }

  async function handleStep2() {
    setError('')
    if (!keychainPassword || keychainPassword !== keychainConfirm) {
      setError(t('import.errorKeyMismatch'))
      return
    }
    if (keychainPassword.length < 8) {
      setError(t('import.errorKeyLength'))
      return
    }
    setLoading(true)
    try {
      const keys = await getKeys(username.trim(), password)
      const encrypted = await encryptKeys(keys, keychainPassword)
      addToKeychain(username.trim(), encrypted)
      await doLogin(username.trim(), password)
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : t('import.errorSave'))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('import.title')}</CardTitle>
          <CardDescription>{t('import.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleStep1()
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="username">{t('import.usernameLabel')}</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('import.passwordLabel')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="store"
                  checked={storeAccount}
                  onCheckedChange={(v) => setStoreAccount(v === true)}
                />
                <Label htmlFor="store" className="font-normal cursor-pointer">
                  {t('import.keepAccount')}
                </Label>
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {storeAccount ? t('common.continue') : t('common.getStarted')}
              </Button>
            </form>
          )}
          {step === 2 && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleStep2()
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="keychain-password">{t('import.keychainPassword')}</Label>
                <Input
                  id="keychain-password"
                  type="password"
                  value={keychainPassword}
                  onChange={(e) => setKeychainPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keychain-confirm">{t('import.keychainConfirm')}</Label>
                <Input
                  id="keychain-confirm"
                  type="password"
                  value={keychainConfirm}
                  onChange={(e) => setKeychainConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {t('common.getStarted')}
              </Button>
            </form>
          )}
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="underline">
              {t('import.loginInstead')}
            </Link>
          </p>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm">
        <Link to="/" className="text-muted-foreground hover:underline">
          {t('common.backToHome')}
        </Link>
      </p>
    </div>
  )
}
