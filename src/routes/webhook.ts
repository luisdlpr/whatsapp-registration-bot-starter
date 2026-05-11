import { Router } from "express";
import type { Request, Response } from "express";
import { config } from "@/config.js";
import { WhatsAppCloudAPIHandler } from "@/services/whatsapp.js";
import type { TextMessage, WhatsAppWebhookPayload } from "@/types/whatsapp.js";
import { MessageHandler } from "@/types/messageHandler.js";
import { logger } from "@/lib/logger";

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
    logger.info("webhook verified");
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

router.post("/", async (req: Request, res: Response) => {
  const body = req.body;
  logger.info("webhook received");
  logger.debug("webhook body", { body });

  try {
    const messages = await messageHandler.parseMessage(
      body as WhatsAppWebhookPayload,
    );

    for (const message of messages) {
      try {
        if (message.type !== "text") {
          logger.debug("no supported response for messages of this type", {
            type: message.type,
          });
          continue;
        }

        const textMessage = message as TextMessage;

        await messageHandler.sendMessage(
          textMessage.from,
          textMessage.from_user_id,
          `hey there! What did you say? ${textMessage.text.body}`,
          { message_id: textMessage.id },
        );
      } catch (err) {
        logger.error(`failed to respond to message`, { message: message.id });
      }
    }
  } catch (error) {
    logger.error(`something went wrong`, { error });
  }

  res.status(200).end();
});

export default router;
