import express from "express";
import { config } from "@/config.js";
import webhookRouter from "@/routes/webhook.js";

const app = express();

app.use(express.json());
app.use("/", webhookRouter);

export default app;

if (process.env.NODE_ENV !== "test") {
  app.listen(config.port, () => {
    console.log(`\nListening on port ${config.port}\n`);
  });
}
