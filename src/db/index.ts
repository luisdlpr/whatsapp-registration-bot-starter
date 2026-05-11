import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

export function createDb(url: string | ":memory:" = ":memory:") {
  const sqlite = new Database(url);
  return drizzle(sqlite, { schema });
}

export type Db = ReturnType<typeof createDb>;

export { schema };
