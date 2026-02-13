import { useSettingsStore } from '@/stores/settings'
import { useTranslation } from '@/i18n'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const DEFAULT_ADDRESS = 'https://api.steemit.com'

export function Settings() {
  const { t, language, setLanguage } = useTranslation()
  const {
    address,
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
    // Also update i18n language if changed
    const newLang = (data.get('language') as string) || 'en'
    if (newLang !== language) {
      setLanguage(newLang)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.title')}</CardTitle>
          <CardDescription>{t('settings.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">{t('settings.addressLabel')}</Label>
              <Input
                id="address"
                name="address"
                type="url"
                defaultValue={address || DEFAULT_ADDRESS}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">{t('settings.languageLabel')}</Label>
              <select
                id="language"
                name="language"
                defaultValue={language || 'en'}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="en">{t('settings.languageEn')}</option>
                <option value="zh">{t('settings.languageZh')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeout">{t('settings.timeoutLabel')}</Label>
              <Input
                id="timeout"
                name="timeout"
                type="text"
                defaultValue={timeout || '60'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">{t('settings.themeLabel')}</Label>
              <select
                id="theme"
                name="theme"
                defaultValue={theme || 'white'}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="white">{t('settings.themeWhite')}</option>
                <option value="dark">{t('settings.themeDark')}</option>
              </select>
            </div>
            <Button type="submit">{t('settings.save')}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
