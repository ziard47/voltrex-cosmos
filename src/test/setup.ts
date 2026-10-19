import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// In-memory mock for chrome.storage.local
const mockStorage: Record<string, unknown> = {}

const chromeMock = {
  storage: {
    local: {
      get: vi.fn(
        (keys: string[] | null, callback: (result: Record<string, unknown>) => void) => {
          if (!keys) {
            callback({ ...mockStorage })
            return
          }
          const res: Record<string, unknown> = {}
          for (const k of keys) {
            if (k in mockStorage) res[k] = mockStorage[k]
          }
          callback(res)
        }
      ),
      set: vi.fn((items: Record<string, unknown>, callback?: () => void) => {
        Object.assign(mockStorage, items)
        if (callback) callback()
      }),
      remove: vi.fn((keys: string | string[], callback?: () => void) => {
        const arr = Array.isArray(keys) ? keys : [keys]
        for (const k of arr) {
          delete mockStorage[k]
        }
        if (callback) callback()
      }),
      clear: vi.fn((callback?: () => void) => {
        for (const k in mockStorage) delete mockStorage[k]
        if (callback) callback()
      }),
    },
  },
  runtime: {
    lastError: null,
    openOptionsPage: vi.fn(),
    getURL: vi.fn((path: string) => `chrome-extension://mock-id/${path}`),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(
      (
        _queryInfo: unknown,
        callback: (tabs: Array<{ url: string; title: string }>) => void
      ) => {
        callback([
          { url: 'https://pаypal.com/signin', title: 'Sign in to your PayPal account' },
        ])
      }
    ),
    create: vi.fn(),
  },
}

// Attach mock globally
Object.defineProperty(globalThis, 'chrome', {
  value: chromeMock,
  writable: true,
})
