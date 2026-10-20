import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import { config } from "@/lib/config";
import * as schema from "./schema";

export type DB = NodePgDatabase<typeof schema>;

type Holder = {
  db?: DB;
  ready?: Promise<DB>;
  close?: () => Promise<void>;
};

// Survive Next.js dev hot reloads: a second PGlite on the same directory would corrupt it.
const g = globalThis as unknown as { __tattvaDb?: Holder };
const holder: Holder = (g.__tattvaDb ??= {});

const MIGRATIONS = path.join(process.cwd(), "drizzle");

async function init(): Promise<DB> {
  const c = config();
  if (c.db.url) {
    const pool = new Pool({ connectionString: c.db.url, max: 10 });
    const db = drizzlePg(pool, { schema });
    holder.close = () => pool.end();
    // Production applies migrations explicitly (npm run db:migrate); dev auto-applies.
    if (!c.isProd) await migratePg(db, { migrationsFolder: MIGRATIONS });
    return db;
  }
  const dir = c.db.pgliteDir === ":memory:" ? undefined : path.resolve(c.db.pgliteDir);
  if (dir) mkdirSync(path.dirname(dir), { recursive: true });
  const client = new PGlite(dir);
  const db = drizzlePglite(client, { schema }) as unknown as DB;
  await migratePglite(db as never, { migrationsFolder: MIGRATIONS });
  holder.close = () => client.close();
  return db;
}

/** Returns the initialised database, applying migrations on first use outside production. */
export function getDb(): Promise<DB> {
  if (holder.db) return Promise.resolve(holder.db);
  holder.ready ??= init().then((db) => (holder.db = db));
  return holder.ready;
}

export async function closeDb() {
  await holder.close?.();
  holder.db = undefined;
  holder.ready = undefined;
  holder.close = undefined;
}

export async function runMigrations() {
  const c = config();
  if (c.db.url) {
    const pool = new Pool({ connectionString: c.db.url, max: 1 });
    await migratePg(drizzlePg(pool), { migrationsFolder: MIGRATIONS });
    await pool.end();
  } else {
    await getDb();
  }
}

export { schema };
