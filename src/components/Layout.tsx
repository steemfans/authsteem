import { useEffect } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { sendPageView } from '@/lib/gtag'
import { useAuthStore } from '@/stores/auth'
import { useTranslation } from '@/i18n'

export function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const username = useAuthStore((s) => s.username)
  const logout = useAuthStore((s) => s.logout)
  const { t } = useTranslation()

  useEffect(() => {
    sendPageView(pathname)
  }, [pathname])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center p-4">
        <Outlet />
      </main>
      <footer className="border-t border-border py-4">
        <nav className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground px-4">
          <Link to="/" className="hover:text-foreground">
            {t('nav.home')}
          </Link>
          {username ? (
            <>
              <Link to="/dashboard" className="hover:text-foreground">
                {t('nav.dashboard')}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hover:text-foreground"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-foreground">
              {t('common.login')}
            </Link>
          )}
          <Link to="/settings" className="hover:text-foreground">
            {t('nav.settings')}
          </Link>
          <Link to="/dev-tools" className="hover:text-foreground">
            {t('nav.devTools')}
          </Link>
        </nav>
      </footer>
    </div>
  )
}
