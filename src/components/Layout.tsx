import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { sendPageView } from '@/lib/gtag'

export function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    sendPageView(pathname)
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center p-4">
        <Outlet />
      </main>
    </div>
  )
}
