import { useAuthStore } from '@/stores/auth'

export function Dashboard() {
  const username = useAuthStore((s) => s.username)
  const account = useAuthStore((s) => s.account)

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {username}</p>
      {account && (
        <pre style={{ fontSize: 12, overflow: 'auto', maxHeight: 300 }}>
          {JSON.stringify(account, null, 2)}
        </pre>
      )}
    </div>
  )
}
