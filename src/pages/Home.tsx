import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

export function Home() {
  const username = useAuthStore((s) => s.username)

  return (
    <div>
      <h1>AuthSteem</h1>
      <p>Signer app for Steem</p>
      {username ? (
        <p>
          Logged in as <strong>{username}</strong>. <Link to="/dashboard">Go to Dashboard</Link>
        </p>
      ) : (
        <p>
          <Link to="/import">Import account</Link> or <Link to="/login">Log in</Link>
        </p>
      )}
    </div>
  )
}
