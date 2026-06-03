import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

interface KeychainLoginFormProps {
  /** Called after a successful login. */
  onSuccess?: () => void
  /** Pre-select account when available in keychain. */
  preferredUsername?: string
  /** Prefix for input ids when multiple forms may exist on one page. */
  idPrefix?: string
  /** Show link to import page below the form. */
  showImportLink?: boolean
  /** Bump to reload accounts after keychain changes (e.g. remove on Login page). */
  keychainRevision?: number
}

export function KeychainLoginForm({
  onSuccess,
  preferredUsername,
  idPrefix = 'login',
  showImportLink = true,
  keychainRevision = 0,
}: KeychainLoginFormProps) {
  const { t } = useTranslation()
  const login = useAuthStore((s) => s.login)
  const [username, setUsername] = useState('')
  const [keychainPassword, setKeychainPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [keychain, setKeychain] = useState<Record<string, string>>({})

  useEffect(() => {
    const stored = getKeychain()
    setKeychain(stored)
    const usernames = Object.keys(stored)
    if (usernames.length === 0) {
      setUsername('')
      return
    }
    if (preferredUsername && stored[preferredUsername]) {
      setUsername(preferredUsername)
      return
    }
    setUsername((current) => (current && stored[current] ? current : usernames[0]))
  }, [preferredUsername, keychainRevision])

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
      setKeychainPassword('')
      onSuccess?.()
    } catch {
      setError(t('login.errorInvalid'))
    }
    setLoading(false)
  }

  const keychainUsers = Object.keys(keychain)
  const usernameId = `${idPrefix}-username`
  const passwordId = `${idPrefix}-password`

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={usernameId}>{t('login.usernameLabel')}</Label>
          <Select
            value={username || '__none'}
            onValueChange={(v) => setUsername(v === '__none' ? '' : v)}
          >
            <SelectTrigger id={usernameId}>
              <SelectValue placeholder={t('login.usernamePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none" className="text-muted-foreground">
                {t('login.selectUser')}
              </SelectItem>
              {keychainUsers.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={passwordId}>{t('login.passwordLabel')}</Label>
          <Input
            id={passwordId}
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
      {showImportLink && (
        <p className="text-center text-sm text-muted-foreground">
          <Link to="/import" className="underline">
            {t('common.import')}
          </Link>
        </p>
      )}
    </div>
  )
}
