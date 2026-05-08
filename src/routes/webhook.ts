import { Router } from "express";
import type { Request, Response } from "express";
import { config } from "../config.js";
import { parseMessage } from "../services/whatsapp.js";
import type { WhatsAppWebhookPayload } from "../types/whatsapp.js";

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
    await parseMessage(req.body as WhatsAppWebhookPayload);
  } catch (err) {
    console.error(err);
  }

  res.status(200).end();
});

export default router;
