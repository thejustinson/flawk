import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DB = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  __flawkDbClient?: ReturnType<typeof postgres>;
  __flawkDb?: DB;
};

function init(): DB {
  if (globalForDb.__flawkDb) return globalForDb.__flawkDb;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.",
    );
  }

  const client =
    globalForDb.__flawkDbClient ?? postgres(connectionString, { prepare: false });

  const instance = drizzle(client, { schema });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__flawkDbClient = client;
    globalForDb.__flawkDb = instance;
  }
  return instance;
}

/**
 * Lazily-initialized Drizzle client. Connecting is deferred until first use so
 * `next build` can import route modules without DATABASE_URL being present.
 */
export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    const instance = init();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
