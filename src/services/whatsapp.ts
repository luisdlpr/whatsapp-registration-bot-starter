import { config } from "@/config.js";
import type {
  Message,
  SendMessageContext,
  SendMessagePayload,
  WhatsAppWebhookPayload,
} from "@/types/whatsapp.js";
import { MessageHandler } from "@/types/messageHandler.js";
import { logger } from "@/lib/logger";

export class WhatsAppCloudAPIHandler implements MessageHandler {
  accessToken: string;
  apiUrl: string;
  phoneId: string;

  constructor(accessToken: string, apiUrl: string, phoneId: string) {
    this.accessToken = accessToken;
    this.apiUrl = apiUrl;
    this.phoneId = phoneId; // change to use metadata
  }

  async sendMessage(
    to: string | undefined,
    recipient: string /* uses user_id */,
    message: string,
    context?: SendMessageContext
  ): Promise<void> {
    const payload: SendMessagePayload = {
      messaging_product: "whatsapp",
      to,
      recipient,
      context,
      type: "text",
      text: { body: message },
    };

    // use metadata instead of phoneId
    const res = await fetch(`${config.apiURL}/${config.phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const jsonData = await res.json();
    if (res.ok) {
      logger.info(`replied to ${to}`);
    } else {
      logger.error(`failed to reply to ${to}`, { body: jsonData });
    }
    return;
  }

  async parseMessage(body: WhatsAppWebhookPayload): Promise<Message[]> {
    // add to an in memory queue?
    const q = [];

    const rejectWebhook = (reason: string, meta?: Record<string, unknown>) => {
      logger.debug(`rejecting webhook: ${reason}`, meta);
    };

    if (body.object !== "whatsapp_business_account") {
      rejectWebhook("object was not of type whatsapp_business_account", {
        objectId: body.object,
      });

      return [];
    }

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field !== "messages") {
          rejectWebhook("change field was not of type messages", {
            entry: entry.id,
            change: change.field,
          });

          continue;
        }

        if (change.value.messages) {
          for (const message of change.value.messages) {
            if (message.type !== "text") {
              rejectWebhook("message was not of type text", {
                entry: entry.id,
                change: change.field,
                message: message.type,
              });
              continue;
            }

            q.push(message);
            logger.info("message received", {
              entry: entry.id,
              message: message.id,
            });
          }
        } else if (change.value.statuses) {
          for (const status of change.value.statuses) {
            rejectWebhook("statuses are currently not ingested", {
              entry: entry.id,
              change: change.field,
              statusId: status.id,
              status: status.status,
            });
            continue;
          }
        } else {
          rejectWebhook("change value has no content", {
            entry: entry.id,
            change: change.field,
          });
          continue;
        }
      }
    }

    return q;
  }
}
