import dotenv from "dotenv";

dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),

  mongoUri: required("MONGODB_URI", "mongodb://127.0.0.1:27017/crumbio"),

  jwt: {
    secret: required("JWT_SECRET", "dev_secret_change_me"),
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },

  mail: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.SMTP_FROM ?? "Crumbio <no-reply@crumbio.local>",
  },

  khalti: {
    secretKey: process.env.KHALTI_SECRET_KEY ?? "",
    baseUrl: process.env.KHALTI_BASE_URL ?? "https://a.khalti.com/api/v2",
  },
};
