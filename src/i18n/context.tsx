import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import translations from './translations.json'

type TranslationValue = string

function getNestedValue(obj: Record<string, unknown>, path: string): TranslationValue | undefined {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return typeof current === 'string' ? current : undefined
}

type I18nContextValue = {
  t: (key: string, params?: Record<string, string | number>) => string
  language: string
  setLanguage: (lang: string) => void
  availableLanguages: string[]
}

const I18nContext = createContext<I18nContextValue | null>(null)

const STORAGE_KEY = 'i18n_language'
const DEFAULT_LANGUAGE = 'en'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && stored in translations) return stored
    return DEFAULT_LANGUAGE
  })

  const setLanguage = useCallback((lang: string) => {
    if (lang in translations) {
      setLanguageState(lang)
      localStorage.setItem(STORAGE_KEY, lang)
    }
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = (translations as Record<string, Record<string, unknown>>)[language] || translations.en
      let value = getNestedValue(dict, key)
      if (value === undefined) {
        // fallback to English
        value = getNestedValue(translations.en, key) ?? key
      }
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (_, k) =>
          params[k] !== undefined ? String(params[k]) : `{{${k}}}`
        )
      }
      return value
    },
    [language]
  )

  const availableLanguages = Object.keys(translations)

  return (
    <I18nContext.Provider value={{ t, language, setLanguage, availableLanguages }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider')
  return ctx
}
