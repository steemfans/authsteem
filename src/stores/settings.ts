/**
 * Settings store: RPC address, language, timeout, theme, chainId.
 * Persisted to localStorage; loadSettings applies address to steem node.
 */

import { create } from 'zustand'
import { setNodeUrl, getConfig, getDynamicGlobalProperties } from '@/lib/steem'

const SETTINGS_KEY = 'settings'
const DEFAULT_ADDRESS = 'https://api.steemit.com'

export interface DynamicGlobalProperties {
  head_block_number?: number
  head_block_id?: string
  [key: string]: unknown
}

interface SettingsState {
  properties: DynamicGlobalProperties
  steemAddressPrefix: string
  chainId: string
  language: string
  timeout: string
  theme: string
  address: string
  // actions
  loadSettings: () => Promise<void>
  saveSettings: (settings: Partial<Pick<SettingsState, 'language' | 'timeout' | 'theme' | 'address'>>) => void
  getDynamicGlobalProperties: () => Promise<void>
  getConfig: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  properties: {},
  steemAddressPrefix: '',
  chainId: '',
  language: 'en',
  timeout: '60',
  theme: 'white',
  address: DEFAULT_ADDRESS,

  loadSettings: async () => {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) {
      await get().getConfig()
      return
    }
    try {
      const settings = JSON.parse(raw) as Partial<SettingsState>
      const address = settings.address ?? DEFAULT_ADDRESS
      await setNodeUrl(address)
      await get().getConfig()
      set({
        language: settings.language ?? 'en',
        timeout: settings.timeout ?? '60',
        theme: settings.theme ?? 'white',
        address,
      })
    } catch (e) {
      console.error("Couldn't load settings", e)
    }
  },

  saveSettings: (settings) => {
    try {
      const prev = localStorage.getItem(SETTINGS_KEY)
      const prevObj = prev ? JSON.parse(prev) : {}
      const next = { ...prevObj, ...settings }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
      if (settings.address) {
        setNodeUrl(settings.address).then(() => get().getConfig())
      }
      set(next)
    } catch (e) {
      console.error("Couldn't save settings", e)
    }
  },

  getDynamicGlobalProperties: async () => {
    const props = await getDynamicGlobalProperties()
    set({ properties: props })
  },

  getConfig: async () => {
    const config = await getConfig()
    set({
      steemAddressPrefix: (config.STEEM_ADDRESS_PREFIX as string) ?? (config.STEEMIT_ADDRESS_PREFIX as string) ?? '',
      chainId: (config.STEEM_CHAIN_ID as string) ?? (config.STEEMIT_CHAIN_ID as string) ?? '',
    })
  },
}))
