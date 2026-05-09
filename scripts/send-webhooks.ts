import { testMessageWebhooks } from "../src/tests/examples/sample_webhooks.js";

const BASE_URL = "http://localhost:3000";
const WEBHOOK_PATH = "/";

async function main() {
  console.log(
    `Sending ${testMessageWebhooks.length} webhook payloads to ${BASE_URL}${WEBHOOK_PATH}\n`,
  );

  for (let i = 0; i < testMessageWebhooks.length; i++) {
    const payload = testMessageWebhooks[i];
    try {
      const res = await fetch(`${BASE_URL}${WEBHOOK_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log(
        `[${i + 1}/${testMessageWebhooks.length}] ${res.status} ${res.statusText}`,
      );
    } catch (err) {
      console.error(`[${i + 1}/${testMessageWebhooks.length}] Failed:`, err);
    }
  }
}

main();
