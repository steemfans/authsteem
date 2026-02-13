import { describe, it, expect } from 'vitest'

describe('I18n', () => {
  it('translations.json has valid structure', async () => {
    const translations = (await import('@/i18n/translations.json')).default
    expect(translations).toHaveProperty('en')
    expect(translations).toHaveProperty('zh')
    expect(translations.en).toHaveProperty('common')
    expect(translations.en).toHaveProperty('home')
    expect(translations.en).toHaveProperty('login')
    expect(translations.en).toHaveProperty('import')
    expect(translations.en).toHaveProperty('settings')
    expect(translations.en).toHaveProperty('sign')
  })

  it('common translations exist', async () => {
    const translations = (await import('@/i18n/translations.json')).default
    expect(translations.en.common).toHaveProperty('login')
    expect(translations.en.common).toHaveProperty('import')
    expect(translations.en.common).toHaveProperty('backToHome')
    expect(translations.zh.common).toHaveProperty('login')
    expect(translations.zh.common).toHaveProperty('import')
    expect(translations.zh.common).toHaveProperty('backToHome')
  })
})
