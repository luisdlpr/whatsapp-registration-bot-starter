import { createDb, Db } from "@/db";
import {
  NewWhatsAppMessageEventsDb,
  NewWhatsAppStatusEventsDb,
  WhatsAppMessageEventsDb,
  whatsappMessageEventsDb,
  WhatsAppStatusEventsDb,
  whatsappStatusEventsDb,
  registeredUsersDb,
  RegisteredUserDb,
} from "@/db/schema";
import { logger } from "@/lib/logger";
import { ProcessingStatus, Repository } from "@/types/repository";
import { Message, Status } from "@/types/whatsapp";
import {
  RegisteredUser,
  RegistrationState,
  City,
  Role,
} from "@/types/registration";
import { eq, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

function rowToUser(row: RegisteredUserDb): RegisteredUser {
  return {
    id: row.id,
    waUserId: row.waUserId,
    registrationState: row.registrationState,
    name: row.name,
    email: row.email,
    phone: row.phone,
    platformUpdatesOptIn: row.platformUpdatesOptIn,
    earlyAccessOptIn: row.earlyAccessOptIn,
    club: row.club,
    city: row.city as City | null,
    role: row.role as Role | null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

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

  messageEvents = {
    create: async (
      message: Message,
      status: ProcessingStatus = "pending"
    ): Promise<void> => {
      const row: NewWhatsAppMessageEventsDb = {
        messageId: message.id,
        timestamp: new Date(Number(message.timestamp) * 1000),
        body: message,
        status,
      };

      await this.db.insert(whatsappMessageEventsDb).values(row);
      logger.debug(`logged message to db`, { id: row.id });
    },

    readAll: async (): Promise<WhatsAppMessageEventsDb[]> => {
      return await this.db.query.whatsappMessageEventsDb.findMany();
    },

    read: async (messageId: string): Promise<Message[]> => {
      const messages = await this.db.query.whatsappMessageEventsDb.findMany({
        where: eq(whatsappMessageEventsDb.messageId, messageId),
      });

      if (!messages || messages.length <= 0) {
        throw new Error("message not found");
      }

      logger.debug(`read message from db`, {
        messageId,
        eventIds: messages.map((m) => m.id),
      });
      return messages.map((m) => m.body as Message);
    },

    update: async (
      eventId: number,
      updates: Partial<NewWhatsAppMessageEventsDb>
    ): Promise<void> => {
      await this.db
        .update(whatsappMessageEventsDb)
        .set(updates)
        .where(eq(whatsappMessageEventsDb.id, eventId));
    },

    flush: async (limit: number = 500): Promise<WhatsAppMessageEventsDb[]> => {
      const deletedMessagesDb = this.db.all<WhatsAppMessageEventsDb>(sql`
        DELETE FROM wa_message_events
        WHERE id NOT IN (
          SELECT id
          FROM wa_message_events
          ORDER BY created_at DESC
          LIMIT ${limit}
        )
        RETURNING *
      `);

      logger.debug(`flushed messages in db`, {
        limit,
        deletedMessages: deletedMessagesDb.map((row) => ({
          id: row.id,
          messageId: row.messageId,
        })),
      });
      return deletedMessagesDb;
    },
  };

  statusEvents = {
    create: async (
      status: Status,
      processingStatus: ProcessingStatus = "pending"
    ): Promise<void> => {
      const row: NewWhatsAppStatusEventsDb = {
        statusId: status.id,
        timestamp: new Date(Number(status.timestamp) * 1000),
        body: status,
        status: processingStatus,
      };

      await this.db.insert(whatsappStatusEventsDb).values(row);
      logger.debug(`logged status to db`, { id: row.id });
    },

    readAll: async (): Promise<WhatsAppStatusEventsDb[]> => {
      return await this.db.query.whatsappStatusEventsDb.findMany();
    },

    read: async (statusId: string): Promise<Status[]> => {
      const statuses = await this.db.query.whatsappStatusEventsDb.findMany({
        where: eq(whatsappStatusEventsDb.statusId, statusId),
      });
      if (!statuses || statuses.length <= 0) {
        throw new Error("status not found");
      }

      logger.debug(`read status from db`, {
        statusId,
        eventIds: statuses.map((s) => s.id),
      });
      return statuses.map((s) => s.body as Status);
    },

    update: async (
      eventId: number,
      updates: Partial<NewWhatsAppStatusEventsDb>
    ): Promise<void> => {
      await this.db
        .update(whatsappStatusEventsDb)
        .set(updates)
        .where(eq(whatsappStatusEventsDb.id, eventId));
    },

    flush: async (limit: number = 500): Promise<WhatsAppStatusEventsDb[]> => {
      const deletedStatusesDb = this.db.all<WhatsAppStatusEventsDb>(sql`
        DELETE FROM wa_status_events
        WHERE id NOT IN (
          SELECT id
          FROM wa_status_events
          ORDER BY created_at DESC
          LIMIT ${limit}
        )
        RETURNING *
      `);

      logger.debug(`flushed statuses in db`, {
        limit,
        deletedStatuses: deletedStatusesDb.map((row) => ({
          eventId: row.id,
          statusId: row.statusId,
        })),
      });
      return deletedStatusesDb;
    },
  };

  registeredUsers = {
    create: async (waUserId: string): Promise<RegisteredUser> => {
      const result = await this.db
        .insert(registeredUsersDb)
        .values({ waUserId, registrationState: "awaiting_name" })
        .returning();
      logger.debug("registered user created", { waUserId });
      return rowToUser(result[0]);
    },

    read: async (waUserId: string): Promise<RegisteredUser | null> => {
      const row = await this.db.query.registeredUsersDb.findFirst({
        where: eq(registeredUsersDb.waUserId, waUserId),
      });
      return row ? rowToUser(row) : null;
    },

    update: async (
      waUserId: string,
      fields: Partial<
        Omit<RegisteredUser, "id" | "waUserId" | "createdAt" | "updatedAt">
      > & { registrationState?: RegistrationState }
    ): Promise<RegisteredUser> => {
      const result = await this.db
        .update(registeredUsersDb)
        .set({ ...fields, updatedAt: new Date() })
        .where(eq(registeredUsersDb.waUserId, waUserId))
        .returning();
      logger.debug("registered user updated", { waUserId, fields });
      return rowToUser(result[0]);
    },

    delete: async (waUserId: string): Promise<void> => {
      await this.db
        .delete(registeredUsersDb)
        .where(eq(registeredUsersDb.waUserId, waUserId));
      logger.debug("registered user deleted", { waUserId });
    },
  };
}
