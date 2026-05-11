import { WhatsAppEntriesDb } from "@/db/schema";
import { WhatsAppEntry } from "./whatsapp";

export type ProcessingStatus = "pending" | "processed" | "failed";

export interface Repository {
  entry: {
    create(entry: WhatsAppEntry, status?: ProcessingStatus): Promise<void>;
    read(waEntryId: string): Promise<WhatsAppEntry>;
    readAll(): Promise<WhatsAppEntriesDb[]>;
    flush(limit?: number): Promise<WhatsAppEntry[]>;
  };
}
