import { Routes } from './routes'
import { I18nProvider } from './i18n'

export default function App() {
  return (
    <I18nProvider>
      <Routes />
    </I18nProvider>
  )
}
