import {
  Message,
  SendMessageContext,
  WhatsAppWebhookPayload,
} from "@/types/whatsapp";

export interface MessageHandler {
  sendMessage: (
    to: string | undefined,
    recipient: string /* uses user_id */,
    message: string,
    context?: SendMessageContext
  ) => Promise<void>;

  parseMessage: (body: WhatsAppWebhookPayload) => Promise<Message[]>;
}

export type MessageQueue = Record<string, never>;
