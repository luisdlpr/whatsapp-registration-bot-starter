import { deps } from "./deps.js";

export async function sendMessage(to, message, context) {
  const res = await fetch(`${deps.apiURL}/${deps.phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${deps.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      context,
      type: "text",
      text: {
        body: message,
      },
    }),
  });

  const data = await res.json();
  console.log(data);
}

export async function parseMessage(body) {
  if (body.object !== "whatsapp_business_account") {
    console.log("message was not of type 'whatsapp_business_account'");
  }

  body.entry.forEach((entry) => {
    entry.changes.forEach((change) => {
      if (change.field === "messages") {
        change.value.messages.forEach((message) => {
          const from = message.from;
          const text = message.text.body;
          const messageId = message.id;

          sendMessage(from, `hey there! What did you say? ${text}`, {
            message_id: messageId,
          });
        });
      }
    });
  });
}
