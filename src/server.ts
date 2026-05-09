import app from "@/app.js";
import { config } from "@/config.js";

process.on("exit", (code) => {
  console.log("Process exiting:", code);
});

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

if (process.env.NODE_ENV !== "test") {
  const server = app.listen(config.port, () => {
    console.log(`\nListening on port ${config.port}\n`);
  });

  console.log(`Server state: ${server.listening}`);
}
