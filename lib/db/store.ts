/**
 * Persistence layer (async).
 *
 * Two interchangeable backends behind one `Collection` API:
 *   • Postgres (Supabase) when DATABASE_URL is set — permanent, production.
 *   • A local JSON file otherwise — zero-config for dev.
 *
 * Everything is stored as documents in a single key/value table
 * `amplo_kv(collection, id, data jsonb)`, so adding an entity type needs no
 * migration. All methods are async so the same code works against a network DB.
 */
import fs from "fs";
import path from "path";
import postgres from "postgres";

interface Entity {
  id: string;
}

const DATABASE_URL = process.env.DATABASE_URL;
export const usingPostgres = Boolean(DATABASE_URL);

/* ---------------- Postgres backend ---------------- */
let sql: ReturnType<typeof postgres> | null = null;
let schemaReady: Promise<unknown> | null = null;

function db() {
  if (!sql) {
    sql = postgres(DATABASE_URL as string, {
      ssl: "require",
      prepare: false, // required for Supabase's transaction pooler (pgbouncer)
      max: 1, // serverless-friendly
      idle_timeout: 20,
    });
  }
  return sql;
}

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = db()`
      create table if not exists amplo_kv (
        collection text not null,
        id text not null,
        data jsonb not null,
        primary key (collection, id)
      )`;
  }
  await schemaReady;
}

/* ---------------- File backend ---------------- */
const DATA_DIR = path.join(process.cwd(), ".data");
function ensureDir(): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

export class Collection<T extends Entity> {
  private cache: Map<string, T> | null = null;
  private file: string;

  constructor(private name: string) {
    this.file = path.join(DATA_DIR, `${name}.json`);
  }

  /* ---- file helpers ---- */
  private fileLoad(): Map<string, T> {
    if (this.cache) return this.cache;
    const map = new Map<string, T>();
    try {
      if (fs.existsSync(this.file)) {
        (JSON.parse(fs.readFileSync(this.file, "utf8")) as T[]).forEach((r) => map.set(r.id, r));
      }
    } catch {
      /* start empty */
    }
    this.cache = map;
    return map;
  }
  private filePersist() {
    if (!this.cache || !ensureDir()) return;
    try {
      fs.writeFileSync(this.file, JSON.stringify([...this.cache.values()], null, 2));
    } catch {
      /* ignore */
    }
  }

  /* ---- public API (async) ---- */
  async all(): Promise<T[]> {
    if (usingPostgres) {
      await ensureSchema();
      const rows = await db()<{ data: T }[]>`select data from amplo_kv where collection = ${this.name}`;
      return rows.map((r) => r.data);
    }
    return [...this.fileLoad().values()];
  }

  async find(pred: (t: T) => boolean): Promise<T[]> {
    return (await this.all()).filter(pred);
  }

  async get(id: string): Promise<T | undefined> {
    if (usingPostgres) {
      await ensureSchema();
      const rows = await db()<{ data: T }[]>`select data from amplo_kv where collection = ${this.name} and id = ${id}`;
      return rows[0]?.data;
    }
    return this.fileLoad().get(id);
  }

  async upsert(item: T): Promise<T> {
    if (usingPostgres) {
      await ensureSchema();
      await db()`
        insert into amplo_kv (collection, id, data)
        values (${this.name}, ${item.id}, ${db().json(item as any)})
        on conflict (collection, id) do update set data = excluded.data`;
      return item;
    }
    this.fileLoad().set(item.id, item);
    this.filePersist();
    return item;
  }

  async update(id: string, patch: Partial<T>): Promise<T | undefined> {
    const cur = await this.get(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch, id } as T;
    await this.upsert(next);
    return next;
  }

  async remove(id: string): Promise<void> {
    if (usingPostgres) {
      await ensureSchema();
      await db()`delete from amplo_kv where collection = ${this.name} and id = ${id}`;
      return;
    }
    this.fileLoad().delete(id);
    this.filePersist();
  }
}

/** Id generator (no external deps). */
export function newId(prefix: string): string {
  const rand = Math.floor(Math.random() * 1e9).toString(36);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}
