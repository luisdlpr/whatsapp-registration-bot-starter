import express from "express";
import { checkEnv, config } from "./config.js";
import webhookRouter from "./routes/webhook.js";

checkEnv();

const app = express();

app.use(express.json());
app.use("/", webhookRouter);

app.listen(config.port, () => {
  console.log(`\nListening on port ${config.port}\n`);
});
