import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { getKeychain, hasAccounts, removeFromKeychain } from '@/lib/keychain'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SavedKeychainAccountsProps {
  /** Incremented by parent to reload the list after external keychain changes. */
  revision?: number
  onAccountsChange?: () => void
}

export function SavedKeychainAccounts({
  revision = 0,
  onAccountsChange,
}: SavedKeychainAccountsProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [pendingRemove, setPendingRemove] = useState<string | null>(null)

  const usernames = Object.keys(getKeychain()).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  )

  if (usernames.length === 0) {
    return null
  }

  function handleConfirmRemove() {
    if (!pendingRemove) return
    removeFromKeychain(pendingRemove)
    setPendingRemove(null)
    onAccountsChange?.()
    if (!hasAccounts()) {
      navigate('/import', { replace: true })
    }
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <div className="px-3 py-2 bg-muted/50 border-b">
          <div className="text-sm font-medium">{t('login.savedAccountsTitle')}</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('login.savedAccountsDescription')}
          </p>
        </div>
        <ul className="divide-y divide-border">
          {usernames.map((name) => (
            <li
              key={`${name}-${revision}`}
              className="flex items-center justify-between gap-3 px-3 py-2.5"
            >
              <span className="font-mono text-sm truncate">{name}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 text-destructive hover:text-destructive"
                onClick={() => setPendingRemove(name)}
                aria-label={t('login.removeFromDeviceAria', { username: name })}
              >
                <Trash2 className="size-4 mr-1.5" aria-hidden />
                {t('login.removeFromDevice')}
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <Dialog
        open={pendingRemove !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemove(null)
        }}
      >
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>{t('login.removeConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('login.removeConfirmDescription', { username: pendingRemove ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setPendingRemove(null)}>
              {t('common.cancel')}
            </Button>
            <Button type="button" variant="destructive" onClick={handleConfirmRemove}>
              {t('login.removeConfirmAction')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
