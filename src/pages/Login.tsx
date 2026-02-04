import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getKeychain } from '@/lib/keychain'
import { decryptKeys } from '@/lib/keychain-helpers'
import { useAuthStore } from '@/stores/auth'

export function Login() {
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
      setError('Username and keychain password are required.')
      return
    }
    const encrypted = keychain[username]
    if (!encrypted) {
      setError('Account not found in keychain.')
      return
    }
    setLoading(true)
    try {
      const keys = await decryptKeys(encrypted, keychainPassword)
      await login(username, keys)
      navigate('/')
    } catch (err) {
      setError('Invalid keychain password or credentials.')
    }
    setLoading(false)
  }

  return (
    <div>
      <h1>Login</h1>
      <Link to="/">Back to Home</Link>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}
      >
        <label>
          Steem username
          <select
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ display: 'block', width: '100%' }}
          >
            {Object.keys(keychain).map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
        <label>
          Keychain password
          <input
            type="password"
            value={keychainPassword}
            onChange={(e) => setKeychainPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit" disabled={loading}>
          Log in
        </button>
      </form>
      <p>
        <Link to="/import">Import account</Link>
      </p>
    </div>
  )
}
