import express from "express";
import webhookRouter from "@/routes/webhook.js";
import { requestLogger } from "./middleware/requestLogger.js";

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use("/", webhookRouter);

export default app;
