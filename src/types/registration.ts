export const REGISTRATION_STATES = [
  "idle",
  "awaiting_name",
  "awaiting_email",
  "awaiting_phone",
  "awaiting_platform_updates",
  "awaiting_early_access",
  "awaiting_club",
  "awaiting_city",
  "awaiting_role",
  "completed",
  "cancelled",
] as const;

export type RegistrationState = (typeof REGISTRATION_STATES)[number];

export const CITY_OPTIONS = [
  "Sydney",
  "Melbourne",
  "Brisbane",
  "Perth",
  "Adelaide",
  "Canberra",
  "Darwin",
  "Hobart",
] as const;

export type City = (typeof CITY_OPTIONS)[number];

export const ROLE_OPTIONS = [
  "Player",
  "Coach",
  "Admin",
  "Umpire",
  "Volunteer",
  "Fan",
] as const;

export type Role = (typeof ROLE_OPTIONS)[number];

export interface RegisteredUser {
  id: number;
  waUserId: string;
  registrationState: RegistrationState;
  name: string | null;
  email: string | null;
  phone: string | null;
  platformUpdatesOptIn: boolean | null;
  earlyAccessOptIn: boolean | null;
  club: string | null;
  city: City | null;
  role: Role | null;
  createdAt: Date;
  updatedAt: Date;
}
