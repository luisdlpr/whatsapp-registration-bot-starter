import { logger } from "@/lib/logger.js";
import { Repository } from "@/types/repository.js";
import {
  CITY_OPTIONS,
  City,
  RegisteredUser,
  RegistrationState,
  ROLE_OPTIONS,
  Role,
} from "@/types/registration.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseYesNo(input: string): boolean | null {
  const lower = input.trim().toLowerCase();
  if (["yes", "y", "1", "yeah", "yep", "sure", "ok"].includes(lower))
    return true;
  if (["no", "n", "0", "nah", "nope", "skip"].includes(lower)) return false;
  return null;
}

function matchCity(input: string): City | null {
  const lower = input.trim().toLowerCase();
  return (CITY_OPTIONS.find((c) => c.toLowerCase() === lower) as City) ?? null;
}

function matchRole(input: string): Role | null {
  const lower = input.trim().toLowerCase();
  return (ROLE_OPTIONS.find((r) => r.toLowerCase() === lower) as Role) ?? null;
}

function cityListText(): string {
  return CITY_OPTIONS.map((c, i) => `${i + 1}. ${c}`).join("\n");
}

function roleListText(): string {
  return ROLE_OPTIONS.map((r, i) => `${i + 1}. ${r}`).join("\n");
}

/* migrate to something like state pattern when necessary */
function promptForState(state: RegistrationState): string {
  switch (state) {
    case "awaiting_name":
      return "Welcome! Let's get you registered. What's your full name?";
    case "awaiting_email":
      return "Great! What's your email address?";
    case "awaiting_phone":
      return "What's your phone number?";
    case "awaiting_platform_updates":
      return "Would you like to receive platform updates? (yes / no)";
    case "awaiting_early_access":
      return "Would you like to opt in for early access to new features? (yes / no)";
    case "awaiting_club":
      return "Which club or school are you associated with? (Type 'skip' if none)";
    case "awaiting_city":
      return `Which city are you in? Please choose one:\n${cityListText()}`;
    case "awaiting_role":
      return `What is your role? Please choose one:\n${roleListText()}`;
    case "completed":
      return "You're all registered! Welcome aboard.";
    case "cancelled":
      return "Registration cancelled. Send any message to start again.";
    default:
      return "Send any message to start registration.";
  }
}

function buildSummary(user: RegisteredUser): string {
  return [
    `Name: ${user.name}`,
    `Email: ${user.email}`,
    `Phone: ${user.phone}`,
    `Platform updates: ${user.platformUpdatesOptIn ? "Yes" : "No"}`,
    `Early access: ${user.earlyAccessOptIn ? "Yes" : "No"}`,
    `Club/School: ${user.club ?? "None"}`,
    `City: ${user.city}`,
    `Role: ${user.role}`,
  ].join("\n");
}

type UserFields = Partial<
  Omit<RegisteredUser, "id" | "waUserId" | "createdAt" | "updatedAt"> & {
    registrationState: RegistrationState;
  }
>;

export class RegistrationStateMachine {
  private repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  async process(
    waUserId: string,
    input: string
  ): Promise<{ reply: string; user: RegisteredUser }> {
    const trimmed = input.trim();
    let user = await this.repository.registeredUsers.read(waUserId);

    if (!user) {
      user = await this.repository.registeredUsers.create(waUserId);
      logger.info("registration started", { waUserId });
      return { reply: promptForState("awaiting_name"), user };
    }

    if (user.registrationState === "cancelled") {
      if (trimmed.toLowerCase() === "restart") {
        await this.repository.registeredUsers.delete(waUserId);
        user = await this.repository.registeredUsers.create(waUserId);
        logger.info("registration restarted", { waUserId });
        return { reply: promptForState("awaiting_name"), user };
      }
      return {
        reply: "Do you want to try registration again? Send 'restart'.",
        user,
      };
    }

    if (user.registrationState === "completed") {
      if (trimmed.toLowerCase() === "restart") {
        await this.repository.registeredUsers.delete(waUserId);
        user = await this.repository.registeredUsers.create(waUserId);
        logger.info("registration restarted", { waUserId });
        return { reply: promptForState("awaiting_name"), user };
      }
      return {
        reply: "You are already registered! Send 'restart' to register again.",
        user,
      };
    }

    if (trimmed.toLowerCase() === "cancel") {
      user = await this.repository.registeredUsers.update(waUserId, {
        registrationState: "cancelled",
      });
      return { reply: promptForState("cancelled"), user };
    }

    if (trimmed.toLowerCase() === "restart") {
      await this.repository.registeredUsers.delete(waUserId);
      user = await this.repository.registeredUsers.create(waUserId);
      logger.info("registration restarted", { waUserId });
      return { reply: promptForState("awaiting_name"), user };
    }

    const { fields, nextState, reply } = this.transition(
      user.registrationState,
      trimmed
    );

    user = await this.repository.registeredUsers.update(waUserId, {
      ...fields,
      registrationState: nextState,
    });

    if (nextState === "completed") {
      return {
        reply: `${promptForState("completed")}\n\n${buildSummary(user)}`,
        user,
      };
    }

    return { reply, user };
  }

  private transition(
    state: RegistrationState,
    input: string
  ): { fields: UserFields; nextState: RegistrationState; reply: string } {
    switch (state) {
      case "awaiting_name": {
        if (input.length < 2) {
          return {
            fields: {},
            nextState: "awaiting_name",
            reply: "Please enter a valid name.",
          };
        }
        return {
          fields: { name: input },
          nextState: "awaiting_email",
          reply: promptForState("awaiting_email"),
        };
      }

      case "awaiting_email": {
        if (!EMAIL_REGEX.test(input)) {
          return {
            fields: {},
            nextState: "awaiting_email",
            reply: "That doesn't look like a valid email. Please try again.",
          };
        }
        return {
          fields: { email: input },
          nextState: "awaiting_phone",
          reply: promptForState("awaiting_phone"),
        };
      }

      case "awaiting_phone": {
        if (input.replace(/\D/g, "").length < 7) {
          return {
            fields: {},
            nextState: "awaiting_phone",
            reply:
              "Please enter a valid phone number (digits only, at least 7).",
          };
        }
        return {
          fields: { phone: input },
          nextState: "awaiting_platform_updates",
          reply: promptForState("awaiting_platform_updates"),
        };
      }

      case "awaiting_platform_updates": {
        const value = parseYesNo(input);
        if (value === null) {
          return {
            fields: {},
            nextState: "awaiting_platform_updates",
            reply: "Please reply with *yes* or *no*.",
          };
        }
        return {
          fields: { platformUpdatesOptIn: value },
          nextState: "awaiting_early_access",
          reply: promptForState("awaiting_early_access"),
        };
      }

      case "awaiting_early_access": {
        const value = parseYesNo(input);
        if (value === null) {
          return {
            fields: {},
            nextState: "awaiting_early_access",
            reply: "Please reply with *yes* or *no*.",
          };
        }
        return {
          fields: { earlyAccessOptIn: value },
          nextState: "awaiting_club",
          reply: promptForState("awaiting_club"),
        };
      }

      case "awaiting_club": {
        const club = input.toLowerCase() === "skip" ? null : input;
        return {
          fields: { club },
          nextState: "awaiting_city",
          reply: promptForState("awaiting_city"),
        };
      }

      case "awaiting_city": {
        const byIndex = parseInt(input, 10);
        const city: City | null =
          !isNaN(byIndex) && byIndex >= 1 && byIndex <= CITY_OPTIONS.length
            ? CITY_OPTIONS[byIndex - 1]
            : matchCity(input);
        if (!city) {
          return {
            fields: {},
            nextState: "awaiting_city",
            reply: `Please choose a valid city by name or number:\n${cityListText()}`,
          };
        }
        return {
          fields: { city },
          nextState: "awaiting_role",
          reply: promptForState("awaiting_role"),
        };
      }

      case "awaiting_role": {
        const byIndex = parseInt(input, 10);
        const role: Role | null =
          !isNaN(byIndex) && byIndex >= 1 && byIndex <= ROLE_OPTIONS.length
            ? ROLE_OPTIONS[byIndex - 1]
            : matchRole(input);
        if (!role) {
          return {
            fields: {},
            nextState: "awaiting_role",
            reply: `Please choose a valid role by name or number:\n${roleListText()}`,
          };
        }
        return { fields: { role }, nextState: "completed", reply: "" };
      }

      default:
        return {
          fields: {},
          nextState: state,
          reply: "Send any message to start registration.",
        };
    }
  }
}
