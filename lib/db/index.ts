import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DB = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  __flawkDbClient?: ReturnType<typeof postgres>;
};

function connect(connectionString: string): DB {
  const client =
    globalForDb.__flawkDbClient ??
    postgres(connectionString, { prepare: false });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__flawkDbClient = client;
  }
  return drizzle(client, { schema });
}

const connectionString = process.env.DATABASE_URL;

/**
 * Real Drizzle client when DATABASE_URL is present (dev, prod). Without it —
 * e.g. `next build` in a bare environment — `db` is a stand-in that throws only
 * when actually used, so importing route modules doesn't fail.
 */
export const db: DB = connectionString
  ? connect(connectionString)
  : (new Proxy({} as DB, {
      get() {
        throw new Error(
          "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.",
        );
      },
    }) as DB);
