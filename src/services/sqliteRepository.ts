import { createDb, Db } from "@/db";
import { WhatsAppEntriesDb, whatsAppEntriesDb } from "@/db/schema";
import { logger } from "@/lib/logger";
import { ProcessingStatus, Repository } from "@/types/repository";
import { WhatsAppEntry } from "@/types/whatsapp";
import { eq, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

export class SqliteRepository implements Repository {
  db: Db;

  constructor(dbName?: string) {
    this.db = createDb(dbName);
    this.initSchema();
    logger.info(`initialized db`, {
      mode: "sqlite",
      dbName: dbName ?? ":memory:",
    });
  }

  initSchema(): void {
    migrate(this.db, {
      migrationsFolder: "./drizzle",
    });
  }

  entry = {
    create: async (
      entry: WhatsAppEntry,
      status: ProcessingStatus = "pending"
    ): Promise<void> => {
      const row = {
        waEntryId: entry.id,
        body: entry,
        status,
      };

      await this.db.insert(whatsAppEntriesDb).values(row);
      logger.debug(`logged entry to db`, { waEntryId: entry.id });
    },

    readAll: async (): Promise<WhatsAppEntriesDb[]> => {
      return await this.db.query.whatsAppEntriesDb.findMany();
    },

    read: async (waEntryId: string): Promise<WhatsAppEntry> => {
      const entry = await this.db.query.whatsAppEntriesDb.findFirst({
        where: eq(whatsAppEntriesDb.waEntryId, waEntryId),
      });

      if (!entry) {
        throw new Error("entry not found");
      }

      logger.debug(`read entry from db`, { waEntryId: entry.waEntryId });
      return entry.body as WhatsAppEntry;
    },
    flush: async (limit: number = 500): Promise<WhatsAppEntry[]> => {
      const deletedEntriesDb = this.db.all<WhatsAppEntriesDb>(sql`
        DELETE FROM wa_entries
        WHERE wa_entry_id NOT IN (
          SELECT wa_entry_id
          FROM wa_entries
          ORDER BY created_at DESC
          LIMIT ${limit}
        )
        RETURNING *
      `);

      const deletedEntries = deletedEntriesDb.map(
        (entry) => entry.body as WhatsAppEntry
      );

      logger.debug(`flushed entries in db`, {
        limit,
        deletedEntries: deletedEntries.map((entry) => entry.id),
      });
      return deletedEntries;
    },
  };
}
