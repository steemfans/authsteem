import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Home } from '@/pages/Home'
import { Dashboard } from '@/pages/Dashboard'
import { Import } from '@/pages/Import'
import { Login } from '@/pages/Login'
import { Sign } from '@/pages/Sign'
import { Settings } from '@/pages/Settings'
import { NotFound } from '@/pages/NotFound'
import { useAuthStore } from '@/stores/auth'
import { hasAccounts } from '@/lib/keychain'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const username = useAuthStore((s) => s.username)
  if (!username) {
    return <Navigate to={hasAccounts() ? '/login' : '/import'} replace />
  }
  return <>{children}</>
}

function BeforeLogin({ children }: { children: React.ReactNode }) {
  if (!hasAccounts()) {
    return <Navigate to="/import" replace />
  }
  return <>{children}</>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'dashboard', element: <RequireAuth><Dashboard /></RequireAuth> },
      { path: 'import', element: <Import /> },
      {
        path: 'login',
        element: (
          <BeforeLogin>
            <Login />
          </BeforeLogin>
        ),
      },
      { path: 'sign/*', element: <Sign /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '/oauth2/authorize', element: <Navigate to="/login" replace /> },
])

export function Routes() {
  return <RouterProvider router={router} />
}
