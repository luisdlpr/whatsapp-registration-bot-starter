import app from "@/app.js";
import { config } from "@/config.js";
import { logger } from "./lib/logger";

process.on("exit", (code) => {
  logger.info("process exiting:", { code });
});

process.on("uncaughtException", logger.error);
process.on("unhandledRejection", logger.error);

if (process.env.NODE_ENV !== "test") {
  const server = app.listen(config.port, () => {
    logger.info(`listening on port`, { port: config.port });
  });

  logger.info(`Server state`, { listening: server.listening });
}
