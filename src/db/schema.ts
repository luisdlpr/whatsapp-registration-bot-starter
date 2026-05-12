/* EXAMPLE

import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const conversations = sqliteTable("conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  waId: text("wa_id").notNull().unique(),
  phoneNumber: text("phone_number").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id),
  waMessageId: text("wa_message_id").notNull().unique(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

*/

import { index } from "drizzle-orm/sqlite-core";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const whatsappMessageEventsDb = sqliteTable(
  "wa_message_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    messageId: text("message_id"),
    timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
    body: text("body", { mode: "json" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    status: text("status", { enum: ["pending", "processed", "failed"] }),
  },
  (table) => [index("wa_message_events_message_id_idx").on(table.messageId)]
);

export type WhatsAppMessageEventsDb =
  typeof whatsappMessageEventsDb.$inferSelect;
export type NewWhatsAppMessageEventsDb =
  typeof whatsappMessageEventsDb.$inferInsert;

export const whatsappStatusEventsDb = sqliteTable(
  "wa_status_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    statusId: text("status_id"),
    timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
    body: text("body", { mode: "json" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    status: text("status", { enum: ["pending", "processed", "failed"] }),
  },
  (table) => [index("wa_status_events_status_id_idx").on(table.statusId)]
);

export type WhatsAppStatusEventsDb = typeof whatsappStatusEventsDb.$inferSelect;
export type NewWhatsAppStatusEventsDb =
  typeof whatsappStatusEventsDb.$inferInsert;
