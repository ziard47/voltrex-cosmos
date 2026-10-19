# Voltrex Cosmos — Privacy-Conscious Phishing & Lookalike Shield

> **Phase 1: Project Foundation & UI**  
> **Phase 2: Domain Intelligence & Detection Engine**  
> **Phase 3: Chrome Integration & Protection Workflow**  
> **Phase 4: Security Audit, QA & Production Release**  
> A privacy-preserving Chrome extension (Manifest V3) that deterministically identifies suspicious lookalike domains, punycode homoglyphs, and phishing indicators, warns users about potential brand impersonation, and helps users navigate to verified official websites.

---

## Architecture & Technology Stack

- **Framework**: React 19 + TypeScript (strict mode enabled)
- **Bundler & Manifest**: Vite 8 + `@crxjs/vite-plugin` (Manifest V3 compliant)
- **Domain Intelligence Engine**: Pure TypeScript, zero React/Chrome API coupling
  - **Public Suffix List Parser**: `tldts` (accurate multi-level TLD & registrable domain extraction)
  - **Punycode Decoder**: RFC 3492/5891 compliant `punycode`
  - **Confusables Engine**: Unicode Technical Standard #39 (UTS #39) Latin/Cyrillic/Greek/Digit confusable matrix
  - **String Similarity**: Fast Damerau-Levenshtein distance algorithm (adjacent transpositions, insertions, deletions, substitutions)
- **Chrome MV3 Integration**:
  - **Navigation Monitor**: Top-level navigation observation via `chrome.webNavigation.onBeforeNavigate`.
  - **Bypass Manager**: Tab-scoped session override tracking to prevent infinite redirect loops.
  - **Dynamic Action Badges**: Real-time threat status badges (`!`, `?`, clear) per tab via `chrome.action`.
  - **Typed IPC Messaging**: Strictly validated message contracts between Popup, Warning Page, Options, and Background Service Worker.
- **UI & Styling Integration**:
  - **Material UI (MUI)**: Accessible UI components, dialogs, switches, badges, and dark cybersecurity theme.
  - **Tailwind CSS**: Layout utilities and design tokens. Configured with `corePlugins.preflight: false` and `important: '#root'` alongside MUI's `<StyledEngineProvider injectFirst>` and `<CssBaseline />` to prevent style or reset conflicts.
- **Testing**: Vitest + React Testing Library + `@testing-library/jest-dom` + `jsdom` (94 passing tests across 15 test suites)
- **Linting & Code Quality**: ESLint (flat config) + Prettier

---

## Manifest V3 Permissions & Least Privilege Justification

Voltrex Cosmos strictly adheres to the principle of least privilege. The extension requests only four permissions:

| Permission      | Justification                                                                                                         |
| :-------------- | :-------------------------------------------------------------------------------------------------------------------- |
| `storage`       | Stores user settings, allowlist rules, and bounded recent detections on-device (`chrome.storage.local`).              |
| `activeTab`     | Grants temporary access to the active tab's URL and title when the user invokes the action popup.                     |
| `webNavigation` | Observes top-level navigations (`frameId === 0`) via `onBeforeNavigate` to inspect hostnames before user interaction. |
| `tabs`          | Redirects the tab to the warning page (`chrome.tabs.update`) when high-confidence impersonation is identified.        |

### Permissions Evaluated and Explicitly Not Requested:

- **Host Permissions (`<all_urls>`, `*://*/*`)**: **NOT REQUESTED**. The extension does not inject content scripts, inspect DOM text, read form inputs, or monitor credentials. Local hostname analysis requires no broad host permissions.
- **`declarativeNetRequest`**: **NOT USED**. Declarative Net Request rules rely on static regex patterns and cannot execute multi-factor Unicode confusable skeletons, Damerau-Levenshtein matrix comparisons, or PSL heuristic trees.
- **`webRequestBlocking`**: Deprecated in Manifest V3 and unavailable for non-enterprise extensions.

---

## Directory Structure

```
voltrex-cosmos/
├── public/                     # Static assets and icons
│   └── logo.png
├── src/
│   ├── background/             # Chrome Extension background service worker (MV3)
│   │   ├── badgeManager.ts     # Action badge and tooltip manager per tab
│   │   ├── bypassManager.ts    # Tab-scoped session override tracking (loop prevention)
│   │   ├── navigationMonitor.ts# Top-level navigation inspector & warning router
│   │   └── serviceWorker.ts    # Service worker lifecycle & typed IPC message coordinator
│   ├── components/             # Reusable UI primitives
│   │   └── common/
│   │       ├── EmptyState.tsx
│   │       ├── HostnameDisplay.tsx
│   │       ├── MockNoticeBanner.tsx
│   │       ├── RiskBadge.tsx
│   │       └── ShieldLogo.tsx
│   ├── engine/                 # Pure TypeScript Domain Intelligence & Detection Engine
│   │   ├── brands/             # Versioned official brand catalog & regional domains
│   │   │   ├── officialCatalog.ts
│   │   │   └── officialCatalog.test.ts
│   │   ├── confusables/        # UTS #39 Unicode confusables & mixed-script detection
│   │   │   ├── unicodeConfusables.ts
│   │   │   └── confusables.test.ts
│   │   ├── parser/             # WHATWG URL & Public Suffix List (PSL) parser
│   │   │   ├── hostnameParser.ts
│   │   │   └── hostnameParser.test.ts
│   │   ├── reputation/         # Threat intelligence provider interface & cache
│   │   │   ├── memoryCache.ts
│   │   │   ├── mockProvider.ts # Mock provider for testing & offline simulation
│   │   │   ├── nullProvider.ts # Honest unconfigured offline default provider
│   │   │   ├── reputation.test.ts
│   │   │   └── types.ts
│   │   ├── rules/              # Explainable risk evaluator & scoring rules
│   │   │   └── riskEvaluator.ts
│   │   ├── similarity/         # Damerau-Levenshtein distance & typosquatting detector
│   │   │   ├── damerauLevenshtein.ts
│   │   │   ├── similarity.test.ts
│   │   │   └── typosquattingDetector.ts
│   │   ├── engine.ts           # DomainIntelligenceEngine coordinator
│   │   ├── engine.test.ts      # End-to-end engine tests with realistic scenarios
│   │   ├── index.ts            # Public engine barrel export
│   │   └── types.ts            # Typed verdicts, findings, and analysis models
│   ├── features/               # Extension user interfaces
│   │   ├── popup/              # Action popup interface
│   │   │   ├── CurrentDomainCard.tsx
│   │   │   ├── PopupApp.tsx
│   │   │   ├── PopupHeader.tsx
│   │   │   └── RecentDetectionsList.tsx
│   │   ├── settings/           # Settings & allowlist management interface
│   │   │   ├── AllowlistManager.tsx
│   │   │   ├── PrivacyPolicyCard.tsx
│   │   │   ├── ProtectionPreferences.tsx
│   │   │   ├── SensitivitySelector.tsx
│   │   │   ├── SettingsApp.tsx
│   │   │   └── ThreatIntelligenceCard.tsx
│   │   └── warning/            # Full-page security warning interface
│   │       ├── IndicatorList.tsx
│   │       ├── SafetyActions.tsx
│   │       ├── ThreatHostCard.tsx
│   │       └── WarningApp.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── useActiveTab.ts
│   │   ├── useDomainSecurity.ts
│   │   ├── useReducedMotion.ts
│   │   └── useSettings.ts
│   ├── services/               # Isolated data & browser services
│   │   ├── detectionService.ts # Live engine adapter with analysis origin tagging
│   │   ├── mockDetectionService.ts
│   │   ├── storageService.ts   # PSL-backed allowlist & bounded history retention
│   │   └── tabService.ts       # Tab queries, IPC dispatch & bypass requests
│   ├── test/
│   │   ├── integration/        # Chrome integration & navigation monitor tests
│   │   │   └── navigationMonitor.test.ts
│   │   ├── regression/         # False-positive & false-negative benchmark corpus
│   │   │   └── domainCorpus.test.ts
│   │   └── setup.ts            # Vitest DOM & storage mocks
│   ├── theme/                  # Design system tokens and MUI theme
│   ├── types/                  # TypeScript interface definitions (IPC messages, settings, domain)
│   └── utils/                  # Domain normalization & sanitization utilities
├── manifest.config.ts          # CRXJS Manifest V3 configuration
├── vite.config.ts              # Vite 8 build & packaging configuration
└── vitest.config.ts            # Vitest unit & integration test configuration
```

---

## Protection Workflow & Security Guarantees

### 1. Navigation Interception & Infinite Loop Prevention

- When top-level navigation occurs (`chrome.webNavigation.onBeforeNavigate` with `frameId === 0`), `NavigationMonitor` extracts the destination URL.
- Unsupported schemes (`chrome:`, `about:`, `file:`, `javascript:`, `data:`, `view-source:`) and internal extension pages (`src/warning/index.html`) are immediately bypassed.
- If a domain triggers a `MALICIOUS` (or `SUSPICIOUS` with sensitive settings) verdict, the tab is redirected via `chrome.tabs.update` to:
  ```
  chrome-extension://<id>/src/warning/index.html?target=<displayHostname>&originalUrl=<encodedUrl>
  ```
- **Loop Prevention**: When a user deliberately clicks _"Proceed to unsafe site anyway (Not recommended)"_, the warning page dispatches a `BYPASS_WARNING` IPC message to the service worker. The `BypassManager` registers a 15-minute tab-scoped override for that hostname. Subsequent navigations to that destination on that tab proceed without triggering the warning page.

### 2. Allowlist Security Guarantees

- All allowlist entries are normalized using WHATWG URL rules and the Public Suffix List.
- Direct matching against Punycode wire format and Unicode display format is supported.
- **Subdomain Spoofing Protection**: An attacker domain embedding an allowlisted brand name (e.g. `paypal.com.attacker.com` or `google.com-phish.net`) will **NEVER** match an allowlist rule for `paypal.com`. Subdomain authorization requires the actual registrable domain to match the allowlisted entry.

### 3. Safe Destination Routing & Open Redirect Prevention

- The warning page strictly validates the `?target=` parameter.
- Proceeding anyway requires explicit validation that the destination protocol is `https:` or `http:`.
- Official destination suggestions are **only** displayed when matched against the versioned, verified brand catalog (`OFFICIAL_BRANDS`). Destination URLs are never guessed or constructed from untrusted page content.

### 4. Privacy & Zero-Telemetry Model

- **Local Heuristics by Default**: All confusables, skeletons, and similarity analyses run 100% locally on the user's CPU.
- **Zero Browsing History Transmission**: No URLs, search queries, URL fragments, cookies, or page contents are sent to remote servers.
- **External Threat Intelligence**: Optional and disabled by default. When enabled, only the minimum registrable domain is queried. If an external provider is unreachable or times out, the result is reported honestly as `UNAVAILABLE` rather than falsely declaring the domain safe.
- **Secret API Key Protection**: Extension packages must never bundle proprietary API secrets. Production external feeds require a privacy-preserving backend proxy.

---

## Threat Intelligence Configuration Guide

Voltrex Cosmos supports plugging in reputation providers through the [`ThreatIntelProvider`](src/engine/reputation/types.ts) interface:

### 1. Default Offline Provider (`NullThreatIntelProvider`)

By default, the engine operates in local deterministic mode. It makes zero network calls and honestly reports that external feeds are unconfigured.

### 2. Mock Provider (`MockThreatIntelProvider`)

Used for automated test suites, demo setups, and timeout simulations without accessing real networks.

### 3. Production External Feed Integration

When integrating third-party intelligence (e.g. Google Safe Browsing, VirusTotal, or enterprise feeds):

- **Never bundle API keys into the client extension package**: Client-side extension JavaScript can be unpacked and inspected by any user.
- **Deploy a backend proxy server**: The proxy validates authentication and strips unnecessary metadata, sending only the registrable domain (`example.com`) to upstream APIs.
- **Implement request timeouts**: Set conservative timeouts (e.g. 2500ms) with `AbortSignal`.
- **Honest failure reporting**: If the proxy is offline or times out, return `{ isAvailable: false, reputationVerdict: 'unknown' }`. The engine marks `threatIntelStatus: 'UNAVAILABLE'` and preserves local deterministic findings without declaring the site benign.

---

## Manifest V3 Architectural Limitations & Remaining Protection Gaps

As a senior browser security engineer, it is essential to be transparent about what client-side Manifest V3 extensions can and cannot guarantee:

1. **Asynchronous Navigation Timing**: In Manifest V3, `webNavigation.onBeforeNavigate` is asynchronous. Chrome does not block TCP connections or DNS resolutions while awaiting extension JavaScript execution. In high-speed network environments, the initial HTTP request may be sent before `chrome.tabs.update` finishes redirecting to the warning screen.
2. **Subresource & In-Page Phishing**: Voltrex Cosmos inspects top-level navigation hostnames. It does not inspect embedded `<iframe>` elements, in-page JavaScript popups, or compromised legitimate websites (e.g., WordPress sites hosting malicious phishing kits on subpaths).
3. **Domain Analysis vs. Content Analysis**: Domain analysis alone cannot prove that a website's content is malicious or benign. A brand-new domain with no typosquatting characteristics could still host malicious credential harvesters, while an unusual domain name could be legitimate.
4. **Service Worker Inactivity**: Chrome terminates Manifest V3 service workers after 30 seconds of inactivity. In-memory caches and tab bypasses are re-hydrated or scoped to tab lifecycles.

---

## Manual Chrome Testing Checklist

Follow this checklist to manually verify extension behavior in Google Chrome:

1. **Installation**:
   - Open `chrome://extensions` in Google Chrome.
   - Enable **Developer mode** (top-right toggle).
   - Click **Load unpacked** and select the `voltrex-cosmos/dist` directory.
   - Verify the Voltrex Cosmos shield icon appears in the toolbar.
2. **Popup UI Check**:
   - Click the extension icon. Verify the popup opens at 360px width with no scrollbars or clipped text.
   - Verify the current domain is displayed along with its risk badge.
   - Toggle the master protection switch; verify settings persist.
3. **Navigation Interception Test**:
   - Navigate to a simulated homoglyph URL (e.g. `http://pаypal.com` with Cyrillic `\u0430`).
   - Verify Chrome immediately redirects to `src/warning/index.html?target=...`.
   - Verify the warning page displays the flagged hostname, homoglyph indicators, and the action badge turns red (`!`).
4. **Loop Prevention & Override**:
   - On the warning page, click _"Proceed to unsafe site anyway (Not recommended)"_.
   - Confirm the override dialog.
   - Verify the browser navigates to destination without redirecting back to the warning screen in an infinite loop.
5. **Safe Official Navigation**:
   - On the warning page, click _"Find Official PayPal Site"_.
   - Verify the modal suggests the verified URL `https://paypal.com` from the trusted catalog.
6. **Allowlist Testing**:
   - Open Settings (`chrome://extensions` -> Voltrex Cosmos -> Extension options).
   - Add a test domain (e.g. `my-test-domain.internal`).
   - Verify the domain appears in the list and can be removed.
7. **Accessibility & Reduced Motion**:
   - Enable "Prefer reduced motion" in OS settings; verify pulse animations cease.
   - Use `Tab` / `Shift+Tab` to navigate through all interactive buttons and verify visible focus outlines.

---

## Setup, Build & Quality Assurance

```bash
# 1. Install dependencies
npm install

# 2. Run code style and lint checks
npm run format      # Prettier formatting verification (100% pass)
npm run lint        # ESLint flat config check (0 errors, 0 warnings)
npm run typecheck   # TypeScript strict mode verification (0 errors)

# 3. Run automated test suite
npm test            # Vitest suite (94/94 passing across 15 test files)

# 4. Build production package
npm run build       # Vite 8 + CRXJS production build & release zip packaging
```

### Production Artifacts:

- **Unpacked Extension**: `dist/` (ready to load in Chrome)
- **Deployment Archive**: `release/crx-voltrex-cosmos-1.0.0.zip` (310 KB)
