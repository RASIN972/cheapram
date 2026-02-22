import { defineConfig } from "drizzle-kit";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: tursoUrl && tursoToken ? "turso" : "sqlite",
  dbCredentials:
    tursoUrl && tursoToken
      ? { url: tursoUrl, authToken: tursoToken }
      : {
          url:
            process.env.DATABASE_PATH?.startsWith("file:")
              ? process.env.DATABASE_PATH
              : `file:${process.env.DATABASE_PATH ?? "./data/cheapram.sqlite"}`,
        },
});
