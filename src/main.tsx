import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useSettingsStore } from './stores/settings'

// Load settings and dynamic global properties before rendering (so Layout/Home can use RPC)
async function init() {
  const loadSettings = useSettingsStore.getState().loadSettings
  const getDynamicGlobalProperties = useSettingsStore.getState().getDynamicGlobalProperties
  await loadSettings()
  await getDynamicGlobalProperties()
}

init().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
