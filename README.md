# WhatsApp Registration Bot

## Commands

### Dev

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
| `npm test`             | Run tests with `node:test`         |

### Database (Drizzle)

| Command               | Description                                                                   |
| --------------------- | ----------------------------------------------------------------------------- |
| `npm run db:generate` | Generate SQL migration files from schema changes                              |
| `npm run db:migrate`  | Apply pending migrations to the database                                      |
| `npm run db:push`     | Push schema directly to DB without migration files (good for dev/prototyping) |
| `npm run db:studio`   | Open Drizzle Studio (browser-based DB GUI)                                    |
| `npm run db:example`  | Run the example script demonstrating drizzle usage                            |

> Migration files are output to `./drizzle/`. The default DB file is `./data/app.db` (configurable in `drizzle.config.ts`). Use `:memory:` for an in-memory SQLite DB (tests, examples).

## Database

Schema is defined in `src/db/schema.ts`. The client factory is in `src/db/index.ts`:

```ts
import { createDb } from "./db/index.js";

const db = createDb("./data/app.db"); // file-based
const db = createDb(":memory:"); // in-memory
```

See `src/db/example.ts` for a working walkthrough of insert, select, and relational queries.
