import * as schema from "./schema";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

type DbInstance = ReturnType<typeof createLibsqlDb> | ReturnType<typeof createSqliteDb>;

function createLibsqlDb() {
  const { createClient } = require("@libsql/client");
  const { drizzle } = require("drizzle-orm/libsql");
  const client = createClient(tursoUrl!, tursoToken!);
  return drizzle(client, { schema });
}

function createSqliteDb() {
  const Database = require("better-sqlite3");
  const { drizzle } = require("drizzle-orm/better-sqlite3");
  const dbPath = process.env.DATABASE_PATH ?? "./data/cheapram.sqlite";
  const sqlite = new Database(dbPath);
  return drizzle(sqlite, { schema });
}

export const db: DbInstance =
  tursoUrl && tursoToken ? createLibsqlDb() : createSqliteDb();

export * from "./schema";
