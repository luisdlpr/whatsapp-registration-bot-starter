import {
  NewWhatsAppMessageEventsDb,
  NewWhatsAppStatusEventsDb,
  WhatsAppMessageEventsDb,
  WhatsAppStatusEventsDb,
} from "@/db/schema";
import { Message, Status } from "./whatsapp";

export type ProcessingStatus = "pending" | "processed" | "failed";

export interface Repository {
  messageEvents: {
    create(message: Message, status?: ProcessingStatus): Promise<void>;
    read(messageId: string): Promise<Message[]>;
    readAll(): Promise<WhatsAppMessageEventsDb[]>;
    update(
      eventId: number,
      updates: Partial<NewWhatsAppMessageEventsDb>
    ): Promise<void>;
    flush(limit?: number): Promise<WhatsAppMessageEventsDb[]>;
  };

  statusEvents: {
    create(status: Status, processingStatus?: ProcessingStatus): Promise<void>;
    read(statusId: string): Promise<Status[]>;
    readAll(): Promise<WhatsAppStatusEventsDb[]>;
    update(
      eventId: number,
      updates: Partial<NewWhatsAppStatusEventsDb>
    ): Promise<void>;
    flush(limit?: number): Promise<WhatsAppStatusEventsDb[]>;
  };
}
