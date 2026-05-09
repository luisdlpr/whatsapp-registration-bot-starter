import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import type { RequestListener } from "http";

process.env["VERIFY_TOKEN"] = "test-verify-token";
process.env["ACCESS_TOKEN"] = "test-access-token";
process.env["WA_PH_ID"] = "test-phone-id";
process.env["WA_API_URL"] = "https://example.com";
process.env["NODE_ENV"] = "test";

let app: RequestListener;

describe("webhook routes", () => {
  before(async () => {
    const mod = await import("../app.js");
    app = mod.default as unknown as RequestListener;
  });

  describe("GET /", () => {
    it("returns 200 and challenge when mode and token match", async () => {
      const res = await request(app).get("/").query({
        "hub.mode": "subscribe",
        "hub.verify_token": "test-verify-token",
        "hub.challenge": "my-challenge",
      });

      assert.equal(res.status, 200);
      assert.equal(res.text, "my-challenge");
    });

    it("returns 403 when token is wrong", async () => {
      const res = await request(app).get("/").query({
        "hub.mode": "subscribe",
        "hub.verify_token": "wrong-token",
        "hub.challenge": "my-challenge",
      });

      assert.equal(res.status, 403);
    });

    it("returns 403 when mode is not subscribe", async () => {
      const res = await request(app).get("/").query({
        "hub.mode": "unsubscribe",
        "hub.verify_token": "test-verify-token",
        "hub.challenge": "my-challenge",
      });

      assert.equal(res.status, 403);
    });
  });

  describe("POST /", () => {
    it("returns 200 for any well-formed body", async () => {
      const res = await request(app)
        .post("/")
        .send({ object: "whatsapp_business_account", entry: [] });

      assert.equal(res.status, 200);
    });

    it("returns 200 even when body is unexpected (error is swallowed)", async () => {
      const res = await request(app).post("/").send({ unexpected: true });

      assert.equal(res.status, 200);
    });
  });
});
