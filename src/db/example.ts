/* EXAMPLE

import { eq } from "drizzle-orm";
import { createDb, schema } from "./index.js";

const db = createDb(":memory:");

db.run(`
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wa_id TEXT NOT NULL UNIQUE,
    phone_number TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id),
    wa_message_id TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
  )
`);

const returned = db
  .insert(schema.conversations)
  .values({ waId: "wa-abc123", phoneNumber: "+1234567890" })
  .returning()
  .all();

const conv = returned[0];

console.log("Created conversation:", conv);

db.insert(schema.messages)
  .values([
    {
      conversationId: conv.id,
      waMessageId: "msg-001",
      role: "user",
      content: "Hello!",
    },
    {
      conversationId: conv.id,
      waMessageId: "msg-002",
      role: "assistant",
      content: "Hi there! How can I help you?",
    },
  ])
  .run();

const allMessages = db
  .select()
  .from(schema.messages)
  .where(eq(schema.messages.conversationId, conv.id))
  .all();

console.log("Messages in conversation:", allMessages);

const conversation = db
  .select()
  .from(schema.conversations)
  .where(eq(schema.conversations.id, conv.id))
  .get();

console.log("Conversation by id:", conversation);

*/
