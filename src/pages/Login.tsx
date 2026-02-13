import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getKeychain } from '@/lib/keychain'
import { decryptKeys } from '@/lib/keychain-helpers'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
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
      navigate('/')
    } catch (err) {
      setError(t('login.errorInvalid'))
    }
    setLoading(false)
  }

  const keychainUsers = Object.keys(keychain)

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('login.title')}</CardTitle>
          <CardDescription>{t('login.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
