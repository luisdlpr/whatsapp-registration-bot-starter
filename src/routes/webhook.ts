import { Router } from "express";
import type { Request, Response } from "express";
import { config } from "@/config.js";
import { WhatsAppCloudAPIHandler } from "@/services/whatsapp.js";
import type { TextMessage, WhatsAppWebhookPayload } from "@/types/whatsapp.js";
import { MessageHandler } from "@/types/messageHandler.js";

const messageHandler: MessageHandler = new WhatsAppCloudAPIHandler(
  config.accessToken,
  config.apiURL,
  config.phoneId,
);

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const {
    "hub.mode": mode,
    "hub.challenge": challenge,
    "hub.verify_token": token,
  } = req.query as Record<string, string>;

  if (mode === "subscribe" && token === config.verifyToken) {
    console.log("WEBHOOK VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

router.post("/", async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const messages = await messageHandler.parseMessage(
      req.body as WhatsAppWebhookPayload,
    );

    for (const message of messages) {
      try {
        if (message.type !== "text") {
          console.log(
            `No supported response for messages of type ${message.type}`,
          );
          continue;
        }

        const textMessage = message as TextMessage;

        await messageHandler.sendMessage(
          textMessage.from_user_id,
          `hey there! What did you say? ${textMessage.text.body}`,
          { message_id: textMessage.id },
        );
      } catch (err) {
        console.error(`failed to respond to message ${message.id}`);
      }
    }
  } catch (err) {
    console.error(err);
  }

  res.status(200).end();
});

export default router;
