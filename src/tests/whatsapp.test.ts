import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { WhatsAppCloudAPIHandler } from "@/services/whatsapp.js";
import type { Message, WhatsAppWebhookPayload } from "@/types/whatsapp.js";
import { testMessageWebhooks } from "./examples/sample_webhooks";
import { SqliteRepository } from "@/services/sqliteRepository";

process.env["VERIFY_TOKEN"] = "test-verify-token";
process.env["ACCESS_TOKEN"] = "test-access-token";
process.env["WA_PH_ID"] = "test-phone-id";
process.env["WA_API_URL"] = "https://example.com";
process.env["NODE_ENV"] = "test";

const repository = new SqliteRepository("help.db");
const handler = new WhatsAppCloudAPIHandler(
  "test-access-token",
  "https://example.com",
  "test-phone-id",
  repository
);

const makePayload = (
  overrides: Partial<WhatsAppWebhookPayload> = {}
): WhatsAppWebhookPayload => ({
  object: "whatsapp_business_account",
  entry: [
    {
      id: "entry-1",
      changes: [
        {
          field: "messages",
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "1234567890",
              phone_number_id: "test-phone-id",
            },
            messages: [
              {
                id: "msg-1",
                from_user_id: "user-1",
                timestamp: "1234567890",
                type: "text",
                text: { body: "hello" },
              },
            ],
          },
        },
      ],
    },
  ],
  ...overrides,
});

describe("WhatsAppCloudAPIHandler.parseMessage", () => {
  beforeEach(async () => {
    await repository.entry.flush(0);
  });
  it("returns text messages from a valid payload", async () => {
    const messages = await handler.parseMessage(makePayload());

    assert.equal(messages.length, 1);
    assert.equal(messages[0].type, "text");
    assert.equal(messages[0].id, "msg-1");
  });

  it("returns empty array when object is not whatsapp_business_account", async () => {
    const messages = await handler.parseMessage(
      makePayload({ object: "other" })
    );

    assert.equal(messages.length, 0);
  });

  it("skips changes where field is not messages", async () => {
    const payload: WhatsAppWebhookPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "entry-1",
          changes: [
            {
              field: "other_field",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "1234567890",
                  phone_number_id: "test-phone-id",
                },
              },
            },
          ],
        },
      ],
    };

    const messages = await handler.parseMessage(payload);
    assert.equal(messages.length, 0);
  });

  it("skips non-text messages", async () => {
    const payload: WhatsAppWebhookPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "entry-1",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "1234567890",
                  phone_number_id: "test-phone-id",
                },
                messages: [
                  {
                    id: "img-1",
                    from_user_id: "user-1",
                    timestamp: "1234567890",
                    type: "image",
                    image: {
                      id: "img-id",
                      mime_type: "image/jpeg",
                      sha256: "abc123",
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const messages = await handler.parseMessage(payload);
    assert.equal(messages.length, 0);
  });

  it("returns empty array when entry list is empty", async () => {
    const messages = await handler.parseMessage(makePayload({ entry: [] }));

    assert.equal(messages.length, 0);
  });

  it("collects multiple text messages across entries", async () => {
    const payload: WhatsAppWebhookPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "entry-1",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "1234567890",
                  phone_number_id: "test-phone-id",
                },
                messages: [
                  {
                    id: "msg-1",
                    from_user_id: "user-1",
                    timestamp: "1234567890",
                    type: "text",
                    text: { body: "first" },
                  },
                  {
                    id: "msg-2",
                    from_user_id: "user-2",
                    timestamp: "1234567891",
                    type: "text",
                    text: { body: "second" },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const messages = await handler.parseMessage(payload);
    assert.equal(messages.length, 2);
  });

  it("send a breadth of test messages from meta docs and see what is parsed", async () => {
    const mockMessageQueue: Message[] = [];

    await Promise.all(
      testMessageWebhooks.map(async (webhookBody: WhatsAppWebhookPayload) => {
        await repository.entry.flush(0);
        const extractedMessages = await handler.parseMessage(webhookBody);
        extractedMessages.forEach((m) => mockMessageQueue.push(m));
      })
    );

    assert.equal(mockMessageQueue.length, 11);

    const messageIds = mockMessageQueue.map((m) => m.id);
    [
      "wamid.AAA001",
      "wamid.AAA002",
      "wamid.AAA003",
      "wamid.AAA005",
      "wamid.CCC001",
      "wamid.CCC002",
      "wamid.EEE001",
      "wamid.EEE002",
      "wamid.FFF001",
      "wamid.FFF002",
      "wamid.GGG001",
    ].forEach((id) =>
      assert(
        messageIds.includes(id),
        `Message ${id} was not in MessageIds ${JSON.stringify(messageIds, null, 2)}`
      )
    );
  });
});
