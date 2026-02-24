import { Routes } from './routes'
import { I18nProvider } from './i18n'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function App() {
  return (
    <I18nProvider>
      <TooltipProvider delayDuration={200}>
        <Routes />
      </TooltipProvider>
    </I18nProvider>
  )
}
