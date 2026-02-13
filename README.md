# AuthSteem

Refactored AuthSteem frontend: **pnpm + React 19 + TypeScript + Vite + shadcn/ui + Zustand**.  
Uses **@steemit/steem-js** (next) for Steem RPC and **@steemit/steem-uri@0.2.1** for signing URIs.  
Web SPA only (no Chrome extension or Electron). Legacy Vue app remains in `legacy/`.

## Features

- **Account Management**: Import accounts using username + password or WIF private key
- **Keychain**: Secure local storage with Web Crypto API (PBKDF2 + AES-GCM)
- **Transaction Signing**: Sign and broadcast Steem transactions via `steem:` URI protocol
- **Dev Tools**: Broadcast operation tester for developers
- **Internationalization**: English and Chinese support
- **Modern UI**: shadcn/ui components with Tailwind CSS v4

## Setup

```bash
pnpm install
pnpm dev      # dev server at http://localhost:5173
pnpm build    # production build → dist/
pnpm preview  # serve dist/
```

## Project Structure

```
src/
├── components/
│   ├── Layout.tsx          # App layout with header navigation
│   ├── Operation/          # Transaction operation display components
│   └── ui/                 # shadcn/ui components (Button, Card, Input, etc.)
├── data/
│   └── operations.json     # Steem operation schemas
├── i18n/
│   ├── context.tsx         # I18nProvider and useTranslation hook
│   ├── index.ts
│   └── translations.json   # en/zh translations
├── lib/
│   ├── auth.ts             # Credentials validation, key derivation
│   ├── keychain.ts         # localStorage keychain management
│   ├── keychain-crypto.ts  # Web Crypto API encryption (PBKDF2 + AES-GCM)
│   ├── keychain-helpers.ts # Re-exports for convenience
│   ├── operation-utils.ts  # VESTS→SP conversion, formatting
│   ├── steem.ts            # Steem RPC API wrapper
│   ├── steem-uri.ts        # @steemit/steem-uri wrapper (decode, encodeOps)
│   └── utils.ts            # cn() helper for Tailwind
├── pages/
│   ├── BroadcastOp.tsx     # Dev tools: operation tester
│   ├── Dashboard.tsx       # User dashboard
│   ├── Home.tsx            # Landing page
│   ├── Import.tsx          # Account import
│   ├── Login.tsx           # Keychain unlock
│   ├── NotFound.tsx        # 404 page
│   ├── Settings.tsx        # RPC node, language, theme settings
│   └── Sign.tsx            # Transaction signing page
├── stores/
│   ├── auth.ts             # Auth state (username, keys, account)
│   └── settings.ts         # Settings state (RPC, language, theme)
├── App.tsx
├── main.tsx
└── routes.tsx
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/dashboard` | User dashboard (requires login) |
| `/import` | Import account |
| `/login` | Unlock keychain account |
| `/sign/*` | Sign transaction from `steem:` URI |
| `/settings` | RPC node, language, theme settings |
| `/dev-tools/broadcast-op` | Developer tools: test broadcast operations |

## Steem SDK

### Version

- `@steemit/steem-js@next` - Latest development version

### Key APIs Used

| Feature | API |
|---------|-----|
| Get accounts | `condenser_api.get_accounts` (via `api.callAsync`) |
| Dynamic global properties | `api.getDynamicGlobalPropertiesAsync()` |
| Config | `api.getConfigAsync()` |
| Sign transaction | `Auth.signTransaction(tx, [wif])` |
| Broadcast | `api.broadcastTransactionAsync(signedTx)` |

### condenser_api.get_accounts

The app uses `condenser_api.get_accounts` instead of `database_api.get_accounts` to match the account structure expected by legacy keychain (memo_key, owner/active/posting.key_auths).

```typescript
// In lib/steem.ts
export async function getAccountsCondenser(usernames: string[]) {
  return api.callAsync('condenser_api.get_accounts', [usernames])
}
```

## Keychain Encryption

### Algorithm

- **Key Derivation**: PBKDF2 with SHA-256, 100,000 iterations
- **Encryption**: AES-GCM (256-bit key)
- **Storage Format**:
  ```json
  {
    "version": "webcrypto-v1",
    "salt": "hex",
    "iv": "hex",
    "ciphertext": "hex"
  }
  ```

### localStorage Key

- Key: `'keychain'`
- Value: `JSON.stringify({ username1: encryptedPayload1, ... })`

### Migration Note

**No legacy triplesec support**. Accounts encrypted with legacy triplesec format cannot be decrypted in the new app. Users need to re-import their accounts.

## Internationalization

- Supported languages: **English (en)**, **Chinese (zh)**
- Language preference stored in localStorage
- Switch language in Settings page

### Adding Translations

Edit `src/i18n/translations.json`:

```json
{
  "en": { "key": "English text" },
  "zh": { "key": "中文文本" }
}
```

Use in components:

```tsx
const { t } = useTranslation()
return <p>{t('key')}</p>
```

## Differences from Legacy

| Aspect | Legacy | New |
|--------|--------|-----|
| Framework | Vue 3 | React 19 |
| State | Vuex | Zustand |
| Build | Vue CLI (Webpack) | Vite |
| Styling | Less + custom CSS | Tailwind CSS v4 + shadcn/ui |
| Steem SDK | dsteem | @steemit/steem-js (next) |
| Encryption | triplesec | Web Crypto API (PBKDF2 + AES-GCM) |
| Platforms | Web, Chrome extension, Electron | Web only |
| OAuth | Yes | No (browser-side signing only) |
| Legacy URI | Supported | Not supported |

## Docker

### Build and Run

```bash
docker build -t authsteem-web .
docker run -p 8080:80 authsteem-web
```

### Dockerfile Details

- **Build stage**: Node 22 Alpine, pnpm install + build
- **Run stage**: nginx:alpine, serves `dist/` with SPA fallback

## Development

### Prerequisites

- Node.js 18+
- pnpm 9+

### Scripts

```bash
pnpm dev      # Start dev server
pnpm build    # Type-check + production build
pnpm lint     # ESLint
pnpm preview  # Preview production build
```

### Adding shadcn/ui Components

```bash
pnpm dlx shadcn@latest add <component>
```

## License

MIT
