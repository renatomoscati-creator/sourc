import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "sourcing.db");

// Ensure the data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Reuse the underlying sqlite connection across Next.js hot reloads in dev
const globalForSqlite = globalThis as unknown as {
  _sqlite: InstanceType<typeof Database> | undefined;
};

if (!globalForSqlite._sqlite) {
  globalForSqlite._sqlite = new Database(DB_PATH);
  globalForSqlite._sqlite.pragma("journal_mode = WAL");
  globalForSqlite._sqlite.pragma("foreign_keys = ON");
  globalForSqlite._sqlite.pragma("busy_timeout = 5000");
}

export const db = drizzle(globalForSqlite._sqlite, { schema });
