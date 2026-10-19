import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json' with { type: 'json' }

export default defineManifest({
  manifest_version: 3,
  name: 'Voltrex Cosmos — Phishing & Lookalike Protection',
  description: pkg.description,
  version: pkg.version,
  icons: {
    48: 'public/logo.png',
  },
  permissions: ['storage', 'activeTab', 'webNavigation', 'tabs'],
  action: {
    default_title: 'Voltrex Cosmos Protection',
    default_icon: {
      48: 'public/logo.png',
    },
    default_popup: 'src/popup/index.html',
  },
  options_ui: {
    page: 'src/settings/index.html',
    open_in_tab: true,
  },
  background: {
    service_worker: 'src/background/serviceWorker.ts',
    type: 'module',
  },
  web_accessible_resources: [
    {
      resources: ['src/warning/index.html', 'src/settings/index.html'],
      matches: ['<all_urls>'],
    },
  ],
})
