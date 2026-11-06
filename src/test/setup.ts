import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Supabase throws at import time when these are missing; tests never hit the network.
import.meta.env.VITE_PUBLIC_SUPABASE_URL ||= 'http://localhost:54321'
import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||= 'test-anon-key'

// Node 26 exposes an unconfigured localStorage global that can shadow jsdom's.
function memoryStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: key => values.get(key) ?? null,
    key: index => [...values.keys()][index] ?? null,
    removeItem: key => {
      values.delete(key)
    },
    setItem: (key, value) => {
      values.set(key, String(value))
    },
  }
}

const storage = typeof window !== 'undefined' && window.localStorage
  ? window.localStorage
  : memoryStorage()

Object.defineProperty(globalThis, 'localStorage', {
  value: storage,
  configurable: true,
})

afterEach(() => {
  cleanup()
  storage.clear()
})
