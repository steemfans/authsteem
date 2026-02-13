import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Home } from '@/pages/Home'
import { I18nProvider } from '@/i18n'

// Mock auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = { username: null, keys: null, account: null }
    return selector ? selector(state) : state
  }),
}))

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nProvider>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </I18nProvider>
  )
}

describe('Home Page', () => {
  it('renders title and description', () => {
    renderWithProviders(<Home />)
    expect(screen.getByText('AuthSteem')).toBeInTheDocument()
    expect(screen.getByText('Signer app for Steem')).toBeInTheDocument()
  })

  it('shows import and login buttons when not logged in', () => {
    renderWithProviders(<Home />)
    expect(screen.getByText('Import account')).toBeInTheDocument()
    expect(screen.getByText('Log in')).toBeInTheDocument()
  })
})
