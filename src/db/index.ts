import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let instance: Db | null = null;

/**
 * Lazily creates the DB connection on first real use (i.e. when a request
 * handler actually runs a query), not at module import time. Next.js
 * imports every route module during the build's page-data collection step,
 * so throwing here eagerly would fail the entire build if DATABASE_URL is
 * missing — even for routes that never touch the database.
 */
function getDb(): Db {
  if (!instance) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not set. Add it to .env.local locally, or to your deployment's environment variables."
      );
    }
    const sql = neon(process.env.DATABASE_URL);
    instance = drizzle(sql, { schema });
  }
  return instance;
}

// Proxy so existing call sites (`db.select()...`) don't need to change,
// while the real connection is only created on first property access.
export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
});
