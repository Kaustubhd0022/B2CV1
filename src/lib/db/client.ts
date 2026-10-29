import "server-only";
import { existsSync, mkdirSync, unlinkSync, readFileSync } from "node:fs";
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
    const isSupabase = c.db.url.includes("supabase") || c.db.url.includes("pooler");
    const pool = new Pool({
      connectionString: c.db.url,
      max: isSupabase ? 5 : 10,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    });
    pool.on("error", (err) => {
      console.warn("PostgreSQL connection error (handled):", err.message);
    });
    const db = drizzlePg(pool, { schema });
    holder.close = () => pool.end();
    // Production applies migrations explicitly (npm run db:migrate); dev auto-applies.
    if (!c.isProd) await migratePg(db, { migrationsFolder: MIGRATIONS });
    try {
      await pool.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" text;');
      await pool.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;');
    } catch {}
    return db;
  }
  const dir = c.db.pgliteDir === ":memory:" ? undefined : path.resolve(c.db.pgliteDir);
  if (dir) {
    mkdirSync(path.dirname(dir), { recursive: true });
    try {
      const pidFile = path.join(dir, "postmaster.pid");
      if (existsSync(pidFile)) unlinkSync(pidFile);
    } catch {}
  }
  const client = new PGlite(dir);
  const db = drizzlePglite(client, { schema }) as unknown as DB;
  try {
    await client.query('SELECT 1 FROM "users" LIMIT 1');
    try {
      await client.exec('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" text;');
      await client.exec('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;');
    } catch (colErr) {
      console.warn("Notice: could not ensure users columns:", colErr);
    }
  } catch {
    try {
      await migratePglite(db as never, { migrationsFolder: MIGRATIONS });
    } catch (err: unknown) {
      console.warn("PGlite migration notice, falling back to 0000_init.sql:", err);
      try {
        const initSqlPath = path.join(MIGRATIONS, "0000_init.sql");
        if (existsSync(initSqlPath)) {
          const sql = readFileSync(initSqlPath, "utf-8");
          const statements = sql.split("--> statement-breakpoint");
          for (const stmt of statements) {
            const trimmed = stmt.trim();
            if (trimmed) {
              await client.exec(trimmed);
            }
          }
        }
      } catch (execErr) {
        console.warn("PGlite init sql fallback notice:", execErr);
      }
    }
  }
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
    const isSupabase = c.db.url.includes("supabase") || c.db.url.includes("pooler");
    const pool = new Pool({
      connectionString: c.db.url,
      max: 1,
      ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    });
    await migratePg(drizzlePg(pool), { migrationsFolder: MIGRATIONS });
    await pool.end();
  } else {
    await getDb();
  }
}

export { schema };
