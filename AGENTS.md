# AGENTS.md - Developer Guidelines for wa-bot-test

## Commands

- **Dev** (watch mode): `npm run dev`
- **Build**: `npm run build`
- **Start** (production): `npm start`
- **Typecheck**: `npm run typecheck`
- **Lint**: `npm run lint`
- **Lint + autofix**: `npm run lint:fix`
- **Format**: `npm run format`
- **Format check**: `npm run format:check`
- **Test**: `npm test`

> Always run `npm run typecheck` and `npm run lint` after making changes to verify correctness.

## Project Structure

```
src/
  app.ts              # Express server entry point
  config.ts           # Environment variable loading and validation
  routes/
    webhook.ts        # GET/POST webhook route handlers
  services/
    whatsapp.ts       # WhatsApp API calls (sendMessage, parseMessage)
  types/
    whatsapp.ts       # Shared TypeScript interfaces for WA payloads
dist/                 # Compiled output (gitignored)
```

## Code Style

- **Language**: TypeScript (strict mode) compiled with `tsc`, run in dev with `tsx`
- **Module system**: Node16 modules — use `import/export` syntax with `.js` extensions in import paths (e.g. `import { config } from "../config.js"`)
- **Types**: Always type function parameters and return values explicitly; avoid `any`
- **Interfaces**: Define shared payload shapes in `src/types/`; use `interface` for object shapes
- **Env vars**: Accessed only through `src/config.ts`; `requireEnv()` throws at startup for missing required vars
- **Error handling**: Use HTTP status codes (200, 403); log errors with `console.error`
- **Naming**: camelCase for variables/functions, PascalCase for interfaces/types
- **Formatting**: 2-space indentation, double quotes for strings
- **Comments**: Only when necessary to explain non-obvious logic

## Architecture

- **src/app.ts**: Creates the Express app and exports it; starts the server unless `NODE_ENV=test`
- **src/tests/**: `node:test` + `supertest` tests; set required env vars at the top of each file
- **src/config.ts**: Loads `.env` via `dotenv`, validates and exports typed `config` object; throws on missing required vars
- **src/routes/webhook.ts**: Handles WhatsApp webhook verification (GET) and incoming messages (POST)
- **src/services/whatsapp.ts**: `sendMessage` and `parseMessage` — all WhatsApp Cloud API interactions
- **src/types/whatsapp.ts**: TypeScript interfaces for all WhatsApp webhook payload shapes
- **Port**: Default 3000, configurable via `PORT` env var
