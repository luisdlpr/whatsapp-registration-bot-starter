import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RegistrationStateMachine } from "@/services/registrationStateMachine.js";
import type { Repository } from "@/types/repository.js";
import type {
  RegisteredUser,
  RegistrationState,
} from "@/types/registration.js";
import { CITY_OPTIONS, ROLE_OPTIONS } from "@/types/registration.js";

process.env["VERIFY_TOKEN"] = "test-verify-token";
process.env["ACCESS_TOKEN"] = "test-access-token";
process.env["WA_PH_ID"] = "test-phone-id";
process.env["WA_API_URL"] = "https://example.com";
process.env["NODE_ENV"] = "test";

function makeUser(overrides: Partial<RegisteredUser> = {}): RegisteredUser {
  return {
    id: 1,
    waUserId: "user-1",
    registrationState: "awaiting_name",
    name: null,
    email: null,
    phone: null,
    platformUpdatesOptIn: null,
    earlyAccessOptIn: null,
    club: null,
    city: null,
    role: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRepository(initialUser: RegisteredUser | null = null): Repository {
  let stored: RegisteredUser | null = initialUser;

  return {
    registeredUsers: {
      create(waUserId: string) {
        stored = makeUser({ waUserId, registrationState: "awaiting_name" });
        return Promise.resolve(stored);
      },
      read() {
        return Promise.resolve(stored);
      },
      readAll() {
        return Promise.resolve(stored ? [stored] : []);
      },
      update(...args: Parameters<Repository["registeredUsers"]["update"]>) {
        stored = { ...stored!, ...args[1] };
        return Promise.resolve(stored);
      },
      delete() {
        stored = null;
        return Promise.resolve();
      },
    },
    messageEvents: {} as Repository["messageEvents"],
    statusEvents: {} as Repository["statusEvents"],
  };
}

describe("RegistrationStateMachine", () => {
  describe("new user — first contact", () => {
    it("creates user and returns welcome/name prompt on first message", async () => {
      const repo = makeRepository(null);
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "hello");
      assert.match(reply, /full name/i);
    });
  });

  describe("awaiting_name", () => {
    it("rejects a single-character name", async () => {
      const repo = makeRepository(
        makeUser({ registrationState: "awaiting_name" })
      );
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "A");
      assert.match(reply, /valid name/i);
    });

    it("rejects an empty string", async () => {
      const repo = makeRepository(
        makeUser({ registrationState: "awaiting_name" })
      );
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", " ");
      assert.match(reply, /valid name/i);
    });

    it("accepts a valid name and advances to awaiting_email", async () => {
      const repo = makeRepository(
        makeUser({ registrationState: "awaiting_name" })
      );
      const sm = new RegistrationStateMachine(repo);
      const { reply, user } = await sm.process("user-1", "Alice Smith");
      assert.equal(user.name, "Alice Smith");
      assert.equal(user.registrationState, "awaiting_email");
      assert.match(reply, /email/i);
    });

    it("trims whitespace before validating name", async () => {
      const repo = makeRepository(
        makeUser({ registrationState: "awaiting_name" })
      );
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "  Jo  ");
      assert.match(reply, /email/i);
    });
  });

  describe("awaiting_email", () => {
    it("rejects a plain string without @", async () => {
      const repo = makeRepository(
        makeUser({ registrationState: "awaiting_email", name: "Alice" })
      );
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "notanemail");
      assert.match(reply, /valid email/i);
    });

    it("rejects a string with @ but no domain", async () => {
      const repo = makeRepository(
        makeUser({ registrationState: "awaiting_email", name: "Alice" })
      );
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "alice@");
      assert.match(reply, /valid email/i);
    });

    it("rejects email with no TLD", async () => {
      const repo = makeRepository(
        makeUser({ registrationState: "awaiting_email", name: "Alice" })
      );
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "alice@domain");
      assert.match(reply, /valid email/i);
    });

    it("accepts a valid email and advances to awaiting_phone", async () => {
      const repo = makeRepository(
        makeUser({ registrationState: "awaiting_email", name: "Alice" })
      );
      const sm = new RegistrationStateMachine(repo);
      const { reply, user } = await sm.process("user-1", "alice@example.com");
      assert.equal(user.email, "alice@example.com");
      assert.equal(user.registrationState, "awaiting_phone");
      assert.match(reply, /phone/i);
    });
  });

  describe("awaiting_phone", () => {
    it("rejects a phone with fewer than 7 digits", async () => {
      const repo = makeRepository(
        makeUser({
          registrationState: "awaiting_phone",
          name: "Alice",
          email: "a@b.com",
        })
      );
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "123");
      assert.match(reply, /valid phone/i);
    });

    it("rejects a non-numeric string with no digits", async () => {
      const repo = makeRepository(
        makeUser({
          registrationState: "awaiting_phone",
          name: "Alice",
          email: "a@b.com",
        })
      );
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "abcdefg");
      assert.match(reply, /valid phone/i);
    });

    it("accepts a 7-digit number and advances to awaiting_platform_updates", async () => {
      const repo = makeRepository(
        makeUser({
          registrationState: "awaiting_phone",
          name: "Alice",
          email: "a@b.com",
        })
      );
      const sm = new RegistrationStateMachine(repo);
      const { reply, user } = await sm.process("user-1", "1234567");
      assert.equal(user.phone, "1234567");
      assert.equal(user.registrationState, "awaiting_platform_updates");
      assert.match(reply, /platform updates/i);
    });

    it("accepts a phone number with formatting characters", async () => {
      const repo = makeRepository(
        makeUser({
          registrationState: "awaiting_phone",
          name: "Alice",
          email: "a@b.com",
        })
      );
      const sm = new RegistrationStateMachine(repo);
      const { reply, user } = await sm.process("user-1", "+61 (02) 9876-5432");
      assert.equal(user.registrationState, "awaiting_platform_updates");
      assert.match(reply, /platform updates/i);
    });
  });

  describe("awaiting_platform_updates", () => {
    const base = {
      registrationState: "awaiting_platform_updates" as RegistrationState,
      name: "Alice",
      email: "a@b.com",
      phone: "1234567",
    };

    it("rejects an unrecognised response", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "maybe");
      assert.match(reply, /yes.*no|no.*yes/i);
    });

    it("accepts 'yes' and advances to awaiting_early_access", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { reply, user } = await sm.process("user-1", "yes");
      assert.equal(user.platformUpdatesOptIn, true);
      assert.equal(user.registrationState, "awaiting_early_access");
      assert.match(reply, /early access/i);
    });

    it("accepts 'no' and stores false", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { user } = await sm.process("user-1", "no");
      assert.equal(user.platformUpdatesOptIn, false);
    });

    for (const alias of ["y", "1", "yeah", "yep", "sure", "ok"]) {
      it(`accepts yes alias '${alias}'`, async () => {
        const repo = makeRepository(makeUser(base));
        const sm = new RegistrationStateMachine(repo);
        const { user } = await sm.process("user-1", alias);
        assert.equal(user.platformUpdatesOptIn, true);
      });
    }

    for (const alias of ["n", "0", "nah", "nope", "skip"]) {
      it(`accepts no alias '${alias}'`, async () => {
        const repo = makeRepository(makeUser(base));
        const sm = new RegistrationStateMachine(repo);
        const { user } = await sm.process("user-1", alias);
        assert.equal(user.platformUpdatesOptIn, false);
      });
    }
  });

  describe("awaiting_early_access", () => {
    const base = {
      registrationState: "awaiting_early_access" as RegistrationState,
      name: "Alice",
      email: "a@b.com",
      phone: "1234567",
      platformUpdatesOptIn: true,
    };

    it("rejects an unrecognised response", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "dunno");
      assert.match(reply, /yes.*no|no.*yes/i);
    });

    it("accepts 'yes' and advances to awaiting_club", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { reply, user } = await sm.process("user-1", "yes");
      assert.equal(user.earlyAccessOptIn, true);
      assert.equal(user.registrationState, "awaiting_club");
      assert.match(reply, /club/i);
    });

    it("accepts 'no' and stores false", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { user } = await sm.process("user-1", "no");
      assert.equal(user.earlyAccessOptIn, false);
    });
  });

  describe("awaiting_club", () => {
    const base = {
      registrationState: "awaiting_club" as RegistrationState,
      name: "Alice",
      email: "a@b.com",
      phone: "1234567",
      platformUpdatesOptIn: true,
      earlyAccessOptIn: false,
    };

    it("stores the club name and advances to awaiting_city", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { reply, user } = await sm.process("user-1", "Sydney FC");
      assert.equal(user.club, "Sydney FC");
      assert.equal(user.registrationState, "awaiting_city");
      assert.match(reply, /city/i);
    });

    it("stores null when user types 'skip'", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { user } = await sm.process("user-1", "skip");
      assert.equal(user.club, null);
      assert.equal(user.registrationState, "awaiting_city");
    });

    it("is case-insensitive for 'skip'", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { user } = await sm.process("user-1", "SKIP");
      assert.equal(user.club, null);
    });

    it("accepts any non-skip string, including numbers", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { user } = await sm.process("user-1", "Club 99");
      assert.equal(user.club, "Club 99");
    });
  });

  describe("awaiting_city", () => {
    const base = {
      registrationState: "awaiting_city" as RegistrationState,
      name: "Alice",
      email: "a@b.com",
      phone: "1234567",
      platformUpdatesOptIn: true,
      earlyAccessOptIn: false,
      club: null,
    };

    it("rejects an unknown city name", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "Atlantis");
      assert.match(reply, /valid city/i);
    });

    it("rejects an out-of-range index", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "99");
      assert.match(reply, /valid city/i);
    });

    it("rejects index 0", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "0");
      assert.match(reply, /valid city/i);
    });

    it("accepts a city by exact name (case-insensitive)", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { user } = await sm.process("user-1", "sydney");
      assert.equal(user.city, "Sydney");
      assert.equal(user.registrationState, "awaiting_role");
    });

    it("accepts a city by 1-based index", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { user } = await sm.process("user-1", "1");
      assert.equal(user.city, CITY_OPTIONS[0]);
    });

    it("accepts the last valid index", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { user } = await sm.process("user-1", String(CITY_OPTIONS.length));
      assert.equal(user.city, CITY_OPTIONS[CITY_OPTIONS.length - 1]);
    });
  });

  describe("awaiting_role", () => {
    const base = {
      registrationState: "awaiting_role" as RegistrationState,
      name: "Alice",
      email: "a@b.com",
      phone: "1234567",
      platformUpdatesOptIn: true,
      earlyAccessOptIn: false,
      club: null,
      city: "Sydney" as const,
    };

    it("rejects an unknown role name", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "Astronaut");
      assert.match(reply, /valid role/i);
    });

    it("rejects an out-of-range index", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "999");
      assert.match(reply, /valid role/i);
    });

    it("accepts a role by exact name (case-insensitive)", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { user } = await sm.process("user-1", "player");
      assert.equal(user.role, "Player");
      assert.equal(user.registrationState, "completed");
    });

    it("accepts a role by 1-based index", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { user } = await sm.process("user-1", "1");
      assert.equal(user.role, ROLE_OPTIONS[0]);
    });

    it("accepts the last valid index", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { user } = await sm.process("user-1", String(ROLE_OPTIONS.length));
      assert.equal(user.role, ROLE_OPTIONS[ROLE_OPTIONS.length - 1]);
    });

    it("reply on completion includes welcome message and summary", async () => {
      const repo = makeRepository(makeUser(base));
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "Player");
      assert.match(reply, /registered/i);
      assert.match(reply, /Alice/);
      assert.match(reply, /a@b\.com/);
      assert.match(reply, /Sydney/);
      assert.match(reply, /Player/);
    });
  });

  describe("completed state", () => {
    it("returns already-registered message for any input", async () => {
      const repo = makeRepository(makeUser({ registrationState: "completed" }));
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "hello");
      assert.match(reply, /already registered/i);
    });

    it("restarts registration on 'restart'", async () => {
      const repo = makeRepository(makeUser({ registrationState: "completed" }));
      const sm = new RegistrationStateMachine(repo);
      const { reply, user } = await sm.process("user-1", "restart");
      assert.equal(user.registrationState, "awaiting_name");
      assert.match(reply, /full name/i);
    });

    it("'restart' is case-insensitive", async () => {
      const repo = makeRepository(makeUser({ registrationState: "completed" }));
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "RESTART");
      assert.match(reply, /full name/i);
    });
  });

  describe("cancelled state", () => {
    it("prompts to send 'restart' for any other input", async () => {
      const repo = makeRepository(makeUser({ registrationState: "cancelled" }));
      const sm = new RegistrationStateMachine(repo);
      const { reply } = await sm.process("user-1", "hello");
      assert.match(reply, /restart/i);
    });

    it("restarts registration on 'restart'", async () => {
      const repo = makeRepository(makeUser({ registrationState: "cancelled" }));
      const sm = new RegistrationStateMachine(repo);
      const { reply, user } = await sm.process("user-1", "restart");
      assert.equal(user.registrationState, "awaiting_name");
      assert.match(reply, /full name/i);
    });
  });

  describe("cancel command (mid-registration)", () => {
    it("cancels from awaiting_name", async () => {
      const repo = makeRepository(
        makeUser({ registrationState: "awaiting_name" })
      );
      const sm = new RegistrationStateMachine(repo);
      const { reply, user } = await sm.process("user-1", "cancel");
      assert.equal(user.registrationState, "cancelled");
      assert.match(reply, /cancelled/i);
    });

    it("cancels from awaiting_email", async () => {
      const repo = makeRepository(
        makeUser({ registrationState: "awaiting_email", name: "Alice" })
      );
      const sm = new RegistrationStateMachine(repo);
      const { user } = await sm.process("user-1", "cancel");
      assert.equal(user.registrationState, "cancelled");
    });

    it("cancel is case-insensitive", async () => {
      const repo = makeRepository(
        makeUser({ registrationState: "awaiting_name" })
      );
      const sm = new RegistrationStateMachine(repo);
      const { user } = await sm.process("user-1", "CANCEL");
      assert.equal(user.registrationState, "cancelled");
    });
  });

  describe("restart command (mid-registration)", () => {
    it("restarts from awaiting_email and clears prior data", async () => {
      const repo = makeRepository(
        makeUser({ registrationState: "awaiting_email", name: "Alice" })
      );
      const sm = new RegistrationStateMachine(repo);
      const { reply, user } = await sm.process("user-1", "restart");
      assert.equal(user.registrationState, "awaiting_name");
      assert.equal(user.name, null);
      assert.match(reply, /full name/i);
    });

    it("restart is case-insensitive", async () => {
      const repo = makeRepository(
        makeUser({ registrationState: "awaiting_email", name: "Alice" })
      );
      const sm = new RegistrationStateMachine(repo);
      const { user } = await sm.process("user-1", "RESTART");
      assert.equal(user.registrationState, "awaiting_name");
    });
  });

  describe("full happy-path flow", () => {
    it("completes registration end-to-end", async () => {
      const repo = makeRepository(null);
      const sm = new RegistrationStateMachine(repo);
      const uid = "user-flow";

      await sm.process(uid, "hello");
      await sm.process(uid, "Bob Jones");
      await sm.process(uid, "bob@example.com");
      await sm.process(uid, "+61412345678");
      await sm.process(uid, "yes");
      await sm.process(uid, "no");
      await sm.process(uid, "skip");
      await sm.process(uid, "Melbourne");
      const { reply, user } = await sm.process(uid, "Coach");

      assert.equal(user.registrationState, "completed");
      assert.equal(user.name, "Bob Jones");
      assert.equal(user.email, "bob@example.com");
      assert.equal(user.city, "Melbourne");
      assert.equal(user.role, "Coach");
      assert.equal(user.platformUpdatesOptIn, true);
      assert.equal(user.earlyAccessOptIn, false);
      assert.equal(user.club, null);
      assert.match(reply, /registered/i);
    });
  });
});
