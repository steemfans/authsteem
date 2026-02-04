import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { credentialsValid, getKeys, getAuthority } from '@/lib/auth'
import { addToKeychain } from '@/lib/keychain'
import { encryptKeys } from '@/lib/keychain-helpers'
import { useAuthStore } from '@/stores/auth'
export function Import() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [storeAccount, setStoreAccount] = useState(true)
  const [keychainPassword, setKeychainPassword] = useState('')
  const [keychainConfirm, setKeychainConfirm] = useState('')
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const authority = getAuthority(undefined, 'active')

  async function handleStep1() {
    setError('')
    if (!username.trim() || !password) {
      setError('Username and password (or private key) are required.')
      return
    }
    setLoading(true)
    try {
      const valid = await credentialsValid(username.trim(), password)
      if (!valid) {
        setError('Invalid credentials.')
        setLoading(false)
        return
      }
      if (storeAccount) {
        setStep(2)
      } else {
        await doLogin(username.trim(), password)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid credentials.')
    }
    setLoading(false)
  }

  async function doLogin(user: string, pwd: string) {
    const keys = await getKeys(user, pwd)
    if (authority && !keys[authority as keyof typeof keys]) {
      setError(`You need to use master or ${authority} key.`)
      return
    }
    await login(user, keys)
    navigate('/')
  }

  async function handleStep2() {
    setError('')
    if (!keychainPassword || keychainPassword !== keychainConfirm) {
      setError('Keychain password and confirmation must match.')
      return
    }
    if (keychainPassword.length < 8) {
      setError('Keychain password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const keys = await getKeys(username.trim(), password)
      const encrypted = await encryptKeys(keys, keychainPassword)
      addToKeychain(username.trim(), encrypted)
      await doLogin(username.trim(), password)
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save or login.')
    }
    setLoading(false)
  }

  return (
    <div>
      <h1>Import account</h1>
      <Link to="/">Back to Home</Link>
      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleStep1()
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}
        >
          <label>
            Steem username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label>
            Password or private key
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={storeAccount}
              onChange={(e) => setStoreAccount(e.target.checked)}
            />
            Keep account on this device
          </label>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <button type="submit" disabled={loading}>
            {storeAccount ? 'Continue' : 'Get started'}
          </button>
        </form>
      )}
      {step === 2 && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleStep2()
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}
        >
          <label>
            Keychain password
            <input
              type="password"
              value={keychainPassword}
              onChange={(e) => setKeychainPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          <label>
            Confirm keychain password
            <input
              type="password"
              value={keychainConfirm}
              onChange={(e) => setKeychainConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <button type="submit" disabled={loading}>
            Get started
          </button>
        </form>
      )}
      <p>
        <Link to="/login">Log in instead</Link>
      </p>
    </div>
  )
}
