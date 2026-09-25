import { Pool, type QueryResultRow } from "pg";
import { attachDatabasePool } from "@vercel/functions";

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Connect a Neon Postgres database to the Vercel project " +
          "(Storage → Neon), then run `vercel env pull .env.local` for local development.",
      );
    }
    pool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 5_000 });
    // Lets Vercel Fluid Compute close idle connections before an instance is suspended.
    attachDatabasePool(pool);
  }
  return pool;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS campaigns (
    id          SERIAL PRIMARY KEY,
    code        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    scans       INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS leads (
    id            SERIAL PRIMARY KEY,
    token         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    phone         TEXT NOT NULL,
    phone_key     TEXT NOT NULL UNIQUE,
    campaign_id   INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
    question_ids  JSONB NOT NULL,
    answers       JSONB NOT NULL DEFAULT '{}'::jsonb,
    score         INTEGER NOT NULL DEFAULT 0,
    discount      INTEGER NOT NULL DEFAULT 0,
    status        TEXT NOT NULL DEFAULT 'playing',
    coupon        TEXT UNIQUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at  TIMESTAMPTZ
  );

  CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
`;

/**
 * Creates the tables on first use, so a fresh Neon database works with no
 * migration step. The advisory lock stops parallel cold starts racing each other.
 */
function ensureSchema() {
  schemaReady ??= (async () => {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(4207311)");
      await client.query(SCHEMA);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  })().catch((error) => {
    schemaReady = null;
    throw error;
  });
  return schemaReady;
}

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  await ensureSchema();
  const { rows } = await getPool().query<T>(text, params);
  return rows;
}

export type Campaign = {
  id: number;
  code: string;
  name: string;
  active: boolean;
  scans: number;
  created_at: Date;
};

export type Lead = {
  id: number;
  token: string;
  name: string;
  phone: string;
  phone_key: string;
  campaign_id: number | null;
  question_ids: string[];
  /** Question id → chosen option indexes. */
  answers: Record<string, number | number[]>;
  score: number;
  discount: number;
  status: "playing" | "completed";
  coupon: string | null;
  created_at: Date;
  completed_at: Date | null;
};
