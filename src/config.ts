import "dotenv/config";

interface Config {
  verifyToken: string;
  accessToken: string;
  phoneId: string;
  port: number;
  apiURL: string;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function checkEnv(): void {
  const required = ["VERIFY_TOKEN", "ACCESS_TOKEN", "WA_PH_ID", "WA_API_URL"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(", ")}`);
  }
}

export const config: Config = {
  verifyToken: requireEnv("VERIFY_TOKEN"),
  accessToken: requireEnv("ACCESS_TOKEN"),
  phoneId: requireEnv("WA_PH_ID"),
  port: parseInt(process.env.PORT ?? "3000", 10),
  apiURL: requireEnv("WA_API_URL"),
};

checkEnv();
