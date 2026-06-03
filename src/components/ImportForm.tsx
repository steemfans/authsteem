import { useState } from 'react'
import { Info } from 'lucide-react'
import { credentialsValid, getKeys, getAuthority } from '@/lib/auth'
import { addToKeychain } from '@/lib/keychain'
import { encryptKeys } from '@/lib/keychain-helpers'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTranslation } from '@/i18n'

/** Simple strength: weak / medium (letters+numbers, 8+) / strong (+ special). */
function getKeychainPasswordStrength(pwd: string): 'weak' | 'medium' | 'strong' {
  if (!pwd || pwd.length < 8) return 'weak'
  const hasLetter = /[a-zA-Z]/.test(pwd)
  const hasDigit = /\d/.test(pwd)
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd)
  if (hasLetter && hasDigit && hasSpecial) return 'strong'
  if (hasLetter && hasDigit) return 'medium'
  return 'weak'
}

function FieldLabelWithHint({
  id,
  label,
  hint,
}: {
  id: string
  label: string
  hint: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            tabIndex={-1}
            className="inline-flex text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded p-0.5"
            aria-label={hint}
          >
            <Info className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {hint}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export interface ImportFormProps {
  /** Called after successful import and login. */
  onSuccess?: () => void
  /** Prefix for input ids when multiple forms may exist on one page. */
  idPrefix?: string
  /** Authority key required for login (defaults to active). */
  requiredAuthority?: string
  /** Show control to switch to login (e.g. in sign dialog). */
  showLoginLink?: boolean
  /** Switch to login view instead of navigating away. */
  onLoginClick?: () => void
}

export function ImportForm({
  onSuccess,
  idPrefix = 'import',
  requiredAuthority,
  showLoginLink = true,
  onLoginClick,
}: ImportFormProps) {
  const { t } = useTranslation()
  const login = useAuthStore((s) => s.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [storeAccount, setStoreAccount] = useState(false)
  const [keychainPassword, setKeychainPassword] = useState('')
  const [keychainConfirm, setKeychainConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const authority = getAuthority(requiredAuthority, 'active')
  const keychainStrength = getKeychainPasswordStrength(keychainPassword)
  const keychainStrongEnough = keychainStrength === 'medium' || keychainStrength === 'strong'
  const keychainReady =
    !storeAccount ||
    (keychainPassword === keychainConfirm && keychainPassword.length >= 8 && keychainStrongEnough)

  const usernameId = `${idPrefix}-username`
  const passwordId = `${idPrefix}-password`
  const storeId = `${idPrefix}-store`
  const keychainPasswordId = `${idPrefix}-keychain-password`
  const keychainConfirmId = `${idPrefix}-keychain-confirm`

  async function doLogin(user: string, pwd: string): Promise<boolean> {
    const keys = await getKeys(user, pwd)
    if (authority && !keys[authority as keyof typeof keys]) {
      setError(t('import.errorAuthority', { authority }))
      return false
    }
    await login(user, keys)
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError(t('import.errorRequired'))
      return
    }
    if (storeAccount) {
      if (!keychainPassword || keychainPassword !== keychainConfirm) {
        setError(t('import.errorKeyMismatch'))
        return
      }
      if (keychainPassword.length < 8) {
        setError(t('import.errorKeyLength'))
        return
      }
      if (!keychainStrongEnough) {
        setError(t('import.errorKeychainStrength'))
        return
      }
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
        const keys = await getKeys(username.trim(), password)
        const encrypted = await encryptKeys(keys, keychainPassword)
        addToKeychain(username.trim(), encrypted)
      }
      const ok = await doLogin(username.trim(), password)
      if (ok) onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('import.errorSave'))
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <FieldLabelWithHint
            id={usernameId}
            label={t('import.usernameLabel')}
            hint={t('import.usernameHint')}
          />
          <Input
            id={usernameId}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="space-y-2">
          <FieldLabelWithHint
            id={passwordId}
            label={t('import.passwordLabel')}
            hint={t('import.passwordHint')}
          />
          <Input
            id={passwordId}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id={storeId}
            checked={storeAccount}
            onCheckedChange={(v) => setStoreAccount(v === true)}
          />
          <Label htmlFor={storeId} className="font-normal cursor-pointer">
            {t('import.keepAccount')}
          </Label>
        </div>
        {storeAccount && (
          <>
            <div className="space-y-2">
              <FieldLabelWithHint
                id={keychainPasswordId}
                label={t('import.keychainPassword')}
                hint={t('import.keychainPasswordHint')}
              />
              <Input
                id={keychainPasswordId}
                type="password"
                value={keychainPassword}
                onChange={(e) => setKeychainPassword(e.target.value)}
                autoComplete="new-password"
              />
              {keychainPassword.length > 0 && (
                <p
                  className={
                    keychainStrength === 'weak'
                      ? 'text-destructive text-xs'
                      : keychainStrength === 'medium'
                        ? 'text-muted-foreground text-xs'
                        : 'text-green-600 dark:text-green-400 text-xs'
                  }
                >
                  {t(
                    `import.keychainStrength${keychainStrength === 'weak' ? 'Weak' : keychainStrength === 'medium' ? 'Medium' : 'Strong'}`
                  )}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <FieldLabelWithHint
                id={keychainConfirmId}
                label={t('import.keychainConfirm')}
                hint={t('import.keychainConfirmHint')}
              />
              <Input
                id={keychainConfirmId}
                type="password"
                value={keychainConfirm}
                onChange={(e) => setKeychainConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </>
        )}
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" disabled={loading || !keychainReady} className="w-full">
          {t('import.importAndLogin')}
        </Button>
      </form>
      {showLoginLink && onLoginClick && (
        <p className="text-center text-sm text-muted-foreground">
          <button type="button" onClick={onLoginClick} className="underline">
            {t('import.loginInstead')}
          </button>
        </p>
      )}
    </div>
  )
}
