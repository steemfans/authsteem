import { Outlet, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n'

export function Layout() {
  const { t } = useTranslation()
  const username = useAuthStore((s) => s.username)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b px-4 py-3 flex flex-wrap items-center gap-3">
        <Link to="/" className="font-semibold text-foreground hover:underline">
          AuthSteem
        </Link>
        <Link to="/" className="text-muted-foreground hover:text-foreground text-sm">
          {t('nav.home')}
        </Link>
        {username ? (
          <>
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground text-sm">
              {t('nav.dashboard')}
            </Link>
            <span className="ml-auto text-sm">{username}</span>
            <Button type="button" variant="outline" size="sm" onClick={logout}>
              {t('nav.logout')}
            </Button>
          </>
        ) : (
          <>
            <Link to="/import" className="text-muted-foreground hover:text-foreground text-sm">
              {t('common.import')}
            </Link>
            <Link to="/login" className="text-muted-foreground hover:text-foreground text-sm">
              {t('common.login')}
            </Link>
          </>
        )}
        <Link to="/settings" className="text-muted-foreground hover:text-foreground text-sm">
          {t('nav.settings')}
        </Link>
        <Link to="/dev-tools/broadcast-op" className="text-muted-foreground hover:text-foreground text-sm">
          {t('nav.devTools')}
        </Link>
      </header>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  )
}
