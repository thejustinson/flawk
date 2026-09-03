import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Next.js keeps runtime secrets in .env.local; load it for drizzle-kit CLI too.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
