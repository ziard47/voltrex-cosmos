import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import zip from 'vite-plugin-zip-pack'
import manifest from './manifest.config'
import pkg from './package.json' with { type: 'json' }

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(rootDir, 'src'),
    },
  },
  plugins: [
    react(),
    crx({ manifest }),
    zip({ outDir: 'release', outFileName: `crx-${pkg.name}-${pkg.version}.zip` }),
  ],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(rootDir, 'src/popup/index.html'),
        warning: resolve(rootDir, 'src/warning/index.html'),
        settings: resolve(rootDir, 'src/settings/index.html'),
      },
    },
  },
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
})
