import express from "express";
import webhookRouter from "@/routes/webhook.js";

const app = express();

app.use(express.json());
app.use("/", webhookRouter);

export default app;
