import { useSettingsStore } from '@/stores/settings'
import { useEffect } from 'react'

const DEFAULT_ADDRESS = 'https://api.steemit.com'

export function Settings() {
  const {
    address,
    language,
    timeout,
    theme,
    loadSettings,
    saveSettings,
  } = useSettingsStore()

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    saveSettings({
      address: (data.get('address') as string) || DEFAULT_ADDRESS,
      language: (data.get('language') as string) || 'en',
      timeout: (data.get('timeout') as string) || '60',
      theme: (data.get('theme') as string) || 'white',
    })
  }

  return (
    <div>
      <h1>Settings</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
        <label>
          RPC address
          <input name="address" type="url" defaultValue={address || DEFAULT_ADDRESS} />
        </label>
        <label>
          Language
          <select name="language" defaultValue={language || 'en'}>
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </label>
        <label>
          Idle timeout (minutes)
          <input name="timeout" type="text" defaultValue={timeout || '60'} />
        </label>
        <label>
          Theme
          <select name="theme" defaultValue={theme || 'white'}>
            <option value="white">White</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  )
}
