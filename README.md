# WhatsApp Registration Bot Starter

A minimal WhatsApp chatbot that captures and validates user interest ahead of full product development.

Users can register their details through a guided conversation flow. Responses are securely stored and structured, allowing businesses to quantify demand and build a contactable early-adopter list.

**Stack:** Express 5, Drizzle ORM, SQLite (swap in any RDBMS), TypeScript, ESLint, Prettier

**Roadmap:** Admin dashboard, richer reply handlers

---

## Getting Started

Copy `.env.example` to `.env` and fill in your values:

| Variable       | Description                                   |
| -------------- | --------------------------------------------- |
| `WA_API_URL`   | WhatsApp Cloud API base URL                   |
| `WA_PH_ID`     | WhatsApp phone number ID                      |
| `VERIFY_TOKEN` | Webhook verification token                    |
| `ACCESS_TOKEN` | WhatsApp Cloud API access token               |
| `PORT`         | Port to listen on (default: 3000)             |
| `DB_NAME`      | SQLite database filename (e.g. `database.db`) |
| `NODE_ENV`     | `dev`, `test`, or `prod`                      |
| `LOG_LEVEL`    | `debug`, `info`, `warn`, or `error`           |

Install project dependencies with `npm run install`

---

## Commands

### Development

| Command                | Description                        |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | Start server with watch mode (tsx) |
| `npm run build`        | Compile TypeScript to `dist/`      |
| `npm start`            | Run compiled production build      |
| `npm run typecheck`    | Type-check without emitting        |
| `npm run lint`         | Lint `src/` with ESLint            |
| `npm run lint:fix`     | Lint and auto-fix                  |
| `npm run format`       | Format `src/` with Prettier        |
| `npm run format:check` | Check formatting without writing   |
| `npm test`             | Run tests                          |

### Database (Drizzle)

| Command               | Description                                                          |
| --------------------- | -------------------------------------------------------------------- |
| `npm run db:generate` | Generate SQL migration files from schema changes                     |
| `npm run db:migrate`  | Apply pending migrations                                             |
| `npm run db:push`     | Push schema directly to DB without migration files (dev/prototyping) |
| `npm run db:studio`   | Open Drizzle Studio (browser-based DB GUI)                           |
| `npm run db:example`  | Run the example script demonstrating Drizzle usage                   |

> Migration files are output to `./drizzle/`. The default DB file is configurable via `DB_NAME` in your `.env`. Use `:memory:` for an in-memory SQLite DB (useful for tests and examples).

---

## Architecture

```
src/
  server.ts                       # Entry point — starts the HTTP server
  app.ts                          # Express app factory
  config.ts                       # Env var loading and validation
  routes/
    webhook.ts                    # GET (verification) + POST (incoming messages)
    debug.ts                      # Debug endpoints
  services/
    whatsapp.ts                   # WhatsApp Cloud API calls (sendMessage, parseMessage)
    registrationStateMachine.ts   # Step-by-step registration conversation logic
    sqliteRepository.ts           # SQLite repository implementation
  types/
    whatsapp.ts                   # WhatsApp webhook payload interfaces
    registration.ts               # Registration state + user types
    repository.ts                 # Repository interface
    messageHandler.ts             # Message handler types
  db/
    schema.ts                     # Drizzle schema definitions
    index.ts                      # DB client factory
  middleware/
    requestLogger.ts              # HTTP request logging middleware
  lib/
    logger.ts                     # Structured logger
  tests/
    registrationStateMachine.test.ts
    webhook.test.ts
    whatsapp.test.ts
```

---

## Database

Schema is defined in `src/db/schema.ts`. Three tables are provided out of the box:

- **`wa_message_events`** — raw incoming WhatsApp message webhook payloads
- **`wa_status_events`** — raw WhatsApp message status update payloads
- **`registered_users`** — user registration records with state tracking

The DB client factory is in `src/db/index.ts`:

```ts
import { createDb } from "./db/index.js";

const db = createDb("./data/app.db"); // file-based
const db = createDb(":memory:"); // in-memory
```

See `src/db/example.ts` for a walkthrough of insert, select, and relational queries.

---

## Registration Flow

The bot walks users through a multi-step registration via `RegistrationStateMachine`. Each incoming message advances the conversation state:

| State                       | Prompt                                  |
| --------------------------- | --------------------------------------- |
| `idle`                      | Any message starts registration         |
| `awaiting_name`             | Full name                               |
| `awaiting_email`            | Email address (validated)               |
| `awaiting_phone`            | Phone number (min 7 digits)             |
| `awaiting_platform_updates` | Opt-in for platform updates (yes/no)    |
| `awaiting_early_access`     | Opt-in for early access (yes/no)        |
| `awaiting_club`             | Club or school (skippable)              |
| `awaiting_city`             | City from a predefined list             |
| `awaiting_role`             | Role (Player, Coach, Admin, etc.)       |
| `completed`                 | Registration complete — summary sent    |
| `cancelled`                 | Cancelled — send `restart` to try again |

At any point, users can send `cancel` to stop or `restart` to start over.

---

## Testing

Tests use Node's built-in `node:test` runner with `supertest` for HTTP assertions. No additional test framework is required.

```bash
npm test
```

Test files live in `src/tests/`. Each file sets required environment variables at the top so tests are fully self-contained. The repository layer is mocked via a typed `Repository` interface, keeping unit tests fast and isolated.
