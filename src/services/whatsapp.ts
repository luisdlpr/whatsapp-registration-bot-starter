import { config } from "@/config.js";
import type {
  Message,
  SendMessageContext,
  SendMessagePayload,
  // TextMessage,
  WhatsAppWebhookPayload,
} from "@/types/whatsapp.js";
import { MessageHandler } from "@/types/messageHandler.js";

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
    context?: SendMessageContext,
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
      console.log(`Replied to ${to}`);
    } else {
      console.log(
        `Failed replying to ${to}, ${res.status}: ${res.statusText}, ${jsonData.error.code}`,
      );
    }

    console.log(jsonData);
    return;
  }

  async parseMessage(body: WhatsAppWebhookPayload): Promise<Message[]> {
    // add to an in memory queue?
    const q = [];

    const rejectWebhook = (subject: string, message: string) => {
      console.log(`Rejecting webhook ${subject}: ${message}`);
    };

    if (body.object !== "whatsapp_business_account") {
      rejectWebhook(
        body.object,
        "object was not of type whatsapp_business_account",
      );

      return [];
    }

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field !== "messages") {
          rejectWebhook(
            `entry=${entry.id} change=${change.field}`,
            "change field was not of type messages",
          );

          continue;
        }

        if (change.value.messages) {
          for (const message of change.value.messages) {
            if (message.type !== "text") {
              rejectWebhook(
                `entry=${entry.id} change=${change.field} message=${message.type}`,
                "message was not of type text",
              );
              continue;
            }

            q.push(message);
          }
        } else if (change.value.statuses) {
          for (const status of change.value.statuses) {
            rejectWebhook(
              `entry=${entry.id} change=${change.field} status=${status.id}, ${status.status}`,
              "statuses are currently not ingested",
            );
            continue;
          }
        } else {
          rejectWebhook(
            `entry=${entry.id} change=${change.field}`,
            "change value has no content",
          );
          continue;
        }
      }
    }

    return q;
  }

  // async reply(message: TextMessage) {
  //   await this.sendMessage(
  //     message.from_user_id,
  //     `hey there! What did you say? ${message.text.body}`,
  //     { message_id: message.id },
  //   );
  // }
}
