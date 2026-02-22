import * as schema from "./schema";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;
const isVercel = process.env.VERCEL === "1";

type DbInstance = ReturnType<typeof createLibsqlDb> | ReturnType<typeof createSqliteDb>;

function createLibsqlDb(url: string, authToken?: string) {
  const { createClient } = require("@libsql/client");
  const { drizzle } = require("drizzle-orm/libsql");
  const client = authToken ? createClient(url, authToken) : createClient({ url });
  return drizzle(client, { schema });
}

function createSqliteDb() {
  const Database = require("better-sqlite3");
  const { drizzle } = require("drizzle-orm/better-sqlite3");
  const fs = require("fs");
  const path = require("path");
  const dbPath = process.env.DATABASE_PATH ?? "./data/cheapram.sqlite";
  const dir = path.dirname(dbPath);
  const usePath = dir !== "." && !fs.existsSync(dir) ? ":memory:" : dbPath;
  const sqlite = new Database(usePath);
  return drizzle(sqlite, { schema });
}

export const db: DbInstance =
  tursoUrl && tursoToken
    ? createLibsqlDb(tursoUrl, tursoToken)
    : isVercel
      ? createLibsqlDb(":memory:")
      : createSqliteDb();

export * from "./schema";
