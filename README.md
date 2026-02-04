# AuthSteem

Refactored AuthSteem frontend (at repo root): **pnpm + React 18 + TypeScript + Vite + Zustand**.  
Uses **@steemit/steem-js** (next) for Steem RPC and **@steemit/steem-uri@0.2.1** for signing URIs.  
Web SPA only (no Chrome extension or Electron). Legacy Vue app remains in `legacy/`.

## Setup

From repo root:

```bash
pnpm install
pnpm dev     # dev server
pnpm build   # production build → dist/
pnpm preview # serve dist/
```

## Structure (repo root)

- `src/lib/` – steem.ts (API, setNodeUrl, getAccountsCondenser, sign, broadcast), auth.ts (credentialsValid, getKeys), keychain.ts, keychain-crypto.ts (Web Crypto API), keychain-helpers.ts, steem-uri.ts
- `src/stores/` – Zustand: settings, auth
- `src/pages/` – Home, Dashboard, Import, Login, Sign, Settings, NotFound
- `src/components/` – Layout (header + outlet)
- `legacy/` – original Vue app (unchanged)

## Docker (Alpine + nginx)

Build image and run:

```bash
docker build -t authsteem-web .
docker run -p 8080:80 authsteem-web
```

Serves the built static files from `dist/` with nginx; SPA fallback to `index.html` for history mode.

## Differences from legacy

- No Chrome extension or Electron; Web only.
- State: Zustand instead of Vuex.
- Steem: @steemit/steem-js instead of dsteem; condenser_api.get_accounts for account keys.
- **Keychain encryption: Web Crypto API (PBKDF2 + AES-GCM)** instead of triplesec; only Web Crypto format is supported.
- Same keychain localStorage key (`'keychain'`) for compatibility with legacy keychain.
