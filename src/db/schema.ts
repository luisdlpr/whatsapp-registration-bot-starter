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

import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const whatsAppEntriesDb = sqliteTable("wa_entries", {
  waEntryId: text("wa_entry_id").primaryKey(),
  body: text("body", { mode: "json" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  status: text("status", { enum: ["pending", "processed", "failed"] }),
});

export type WhatsAppEntriesDb = typeof whatsAppEntriesDb.$inferSelect;
export type NewWhatsAppEntriesDb = typeof whatsAppEntriesDb.$inferInsert;
