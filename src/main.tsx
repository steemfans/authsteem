import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useSettingsStore } from './stores/settings'

// Load settings and dynamic global properties in background (do not block first paint)
function init() {
  const loadSettings = useSettingsStore.getState().loadSettings
  const getDynamicGlobalProperties = useSettingsStore.getState().getDynamicGlobalProperties
  loadSettings()
    .then(() => getDynamicGlobalProperties())
    .catch((err) => console.error('Init failed:', err))
}

// Render immediately so the page is never blank (e.g. when RPC is slow or blocked in embedded browser)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
init()
