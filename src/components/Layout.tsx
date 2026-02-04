import { Outlet, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

export function Layout() {
  const username = useAuthStore((s) => s.username)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/" style={{ fontWeight: 'bold', textDecoration: 'none', color: 'inherit' }}>
          AuthSteem
        </Link>
        <Link to="/">Home</Link>
        {username ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <span style={{ marginLeft: 'auto' }}>{username}</span>
            <button type="button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/import">Import</Link>
            <Link to="/login">Login</Link>
          </>
        )}
        <Link to="/settings">Settings</Link>
      </header>
      <main style={{ flex: 1, padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  )
}
