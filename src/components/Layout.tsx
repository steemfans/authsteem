import { Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center p-4">
        <Outlet />
      </main>
    </div>
  )
}
