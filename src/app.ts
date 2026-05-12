import express from "express";
import createWebhookRouter from "@/routes/webhook.js";
import createDebugRouter from "@/routes/debug.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { Repository } from "./types/repository.js";
import { SqliteRepository } from "./services/sqliteRepository.js";
import { MessageHandler } from "./types/messageHandler.js";
import { WhatsAppCloudAPIHandler } from "./services/whatsapp.js";
import { RegistrationStateMachine } from "./services/registrationStateMachine.js";
import { config } from "./config.js";

const app = express();

const repository: Repository = new SqliteRepository(config.dbName);
const stateMachine = new RegistrationStateMachine(repository);
const messageHandler: MessageHandler = new WhatsAppCloudAPIHandler(
  config.accessToken,
  config.apiURL,
  config.phoneId,
  repository
);

app.use(express.json());
app.use(requestLogger);
app.use("/", createWebhookRouter(stateMachine, messageHandler));
if (config.environment !== "prod") {
  app.use("/debug", createDebugRouter(repository));
}

export default app;
