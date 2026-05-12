import { createDb, Db } from "@/db";
import {
  NewWhatsAppMessagesDb,
  NewWhatsAppStatusesDb,
  WhatsAppMessagesDb,
  whatsappMessagesDb,
  WhatsAppStatusesDb,
  whatsappStatusesDb,
} from "@/db/schema";
import { logger } from "@/lib/logger";
import { ProcessingStatus, Repository } from "@/types/repository";
import { Message, Status } from "@/types/whatsapp";
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

  messages = {
    create: async (
      message: Message,
      status: ProcessingStatus = "pending"
    ): Promise<void> => {
      const row: NewWhatsAppMessagesDb = {
        id: message.id,
        timestamp: new Date(Number(message.timestamp) * 1000),
        body: message,
        status,
      };

      await this.db.insert(whatsappMessagesDb).values(row);
      logger.debug(`logged message to db`, { id: row.id });
    },

    readAll: async (): Promise<WhatsAppMessagesDb[]> => {
      return await this.db.query.whatsappMessagesDb.findMany();
    },

    read: async (messageId: string): Promise<Message> => {
      const message = await this.db.query.whatsappMessagesDb.findFirst({
        where: eq(whatsappMessagesDb.id, messageId),
      });

      if (!message) {
        throw new Error("message not found");
      }

      logger.debug(`read message from db`, { id: message.id });
      return message.body as Message;
    },
    update: async (
      messageId: string,
      updates: Partial<NewWhatsAppMessagesDb>
    ): Promise<void> => {
      await this.db
        .update(whatsappMessagesDb)
        .set(updates)
        .where(eq(whatsappMessagesDb.id, messageId));
    },
    flush: async (limit: number = 500): Promise<WhatsAppMessagesDb[]> => {
      const deletedMessagesDb = this.db.all<WhatsAppMessagesDb>(sql`
        DELETE FROM wa_messages
        WHERE id NOT IN (
          SELECT id
          FROM wa_messages
          ORDER BY created_at DESC
          LIMIT ${limit}
        )
        RETURNING *
      `);

      logger.debug(`flushed messages in db`, {
        limit,
        deletedMessages: deletedMessagesDb.map((row) => row.id),
      });
      return deletedMessagesDb;
    },
  };

  statuses = {
    create: async (
      status: Status,
      processingStatus: ProcessingStatus = "pending"
    ): Promise<void> => {
      const row: NewWhatsAppStatusesDb = {
        id: status.id,
        timestamp: new Date(Number(status.timestamp) * 1000),
        body: status,
        status: processingStatus,
      };

      await this.db.insert(whatsappStatusesDb).values(row);
      logger.debug(`logged status to db`, { id: row.id });
    },

    readAll: async (): Promise<WhatsAppStatusesDb[]> => {
      return await this.db.query.whatsappStatusesDb.findMany();
    },

    read: async (statusId: string): Promise<Status> => {
      const status = await this.db.query.whatsappStatusesDb.findFirst({
        where: eq(whatsappStatusesDb.id, statusId),
      });

      if (!status) {
        throw new Error("status not found");
      }

      logger.debug(`read status from db`, { id: status.id });
      return status.body as Status;
    },
    update: async (
      statusId: string,
      updates: Partial<NewWhatsAppStatusesDb>
    ): Promise<void> => {
      await this.db
        .update(whatsappStatusesDb)
        .set(updates)
        .where(eq(whatsappStatusesDb.id, statusId));
    },
    flush: async (limit: number = 500): Promise<WhatsAppStatusesDb[]> => {
      const deletedStatusesDb = this.db.all<WhatsAppStatusesDb>(sql`
        DELETE FROM wa_statuses
        WHERE id NOT IN (
          SELECT id
          FROM wa_statuses
          ORDER BY created_at DESC
          LIMIT ${limit}
        )
        RETURNING *
      `);

      logger.debug(`flushed statuses in db`, {
        limit,
        deletedStatuses: deletedStatusesDb.map((row) => row.id),
      });
      return deletedStatusesDb;
    },
  };
}
