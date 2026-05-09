import {
  Message,
  SendMessageContext,
  WhatsAppWebhookPayload,
} from "@/types/whatsapp";

export interface MessageHandler {
  sendMessage: (
    to: string,
    message: string,
    context?: SendMessageContext,
  ) => Promise<void>;

  parseMessage: (body: WhatsAppWebhookPayload) => Promise<Message[]>;
}

export interface MessageQueue { }
