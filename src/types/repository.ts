import {
  NewWhatsAppMessagesDb,
  NewWhatsAppStatusesDb,
  WhatsAppMessagesDb,
  WhatsAppStatusesDb,
} from "@/db/schema";
import { Message, Status } from "./whatsapp";

export type ProcessingStatus = "pending" | "processed" | "failed";

export interface Repository {
  messages: {
    create(message: Message, status?: ProcessingStatus): Promise<void>;
    read(messageId: string): Promise<Message>;
    readAll(): Promise<WhatsAppMessagesDb[]>;
    update(
      messageId: string,
      updates: Partial<NewWhatsAppMessagesDb>
    ): Promise<void>;
    flush(limit?: number): Promise<WhatsAppMessagesDb[]>;
  };

  statuses: {
    create(status: Status, processingStatus?: ProcessingStatus): Promise<void>;
    read(statusId: string): Promise<Status>;
    readAll(): Promise<WhatsAppStatusesDb[]>;
    update(
      statusId: string,
      updates: Partial<NewWhatsAppStatusesDb>
    ): Promise<void>;
    flush(limit?: number): Promise<WhatsAppStatusesDb[]>;
  };
}
