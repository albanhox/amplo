/**
 * Tiny persistence layer.
 *
 * Backs each collection with a JSON file under `.data/` and keeps an in-memory
 * cache. If the filesystem is read-only (some serverless hosts), it degrades to
 * pure in-memory so the app never crashes.
 *
 * This is intentionally swappable: implement the same `Collection` shape over
 * Postgres/Supabase/Prisma for production and nothing else has to change.
 */
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");

interface Entity {
  id: string;
}

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

  private load(): Map<string, T> {
    if (this.cache) return this.cache;
    const map = new Map<string, T>();
    try {
      if (fs.existsSync(this.file)) {
        const rows = JSON.parse(fs.readFileSync(this.file, "utf8")) as T[];
        for (const r of rows) map.set(r.id, r);
      }
    } catch {
      /* start empty */
    }
    this.cache = map;
    return map;
  }

  private persist() {
    if (!this.cache) return;
    if (!ensureDir()) return; // read-only fs → memory only
    try {
      fs.writeFileSync(this.file, JSON.stringify([...this.cache.values()], null, 2));
    } catch {
      /* ignore — memory cache still valid for this process */
    }
  }

  all(): T[] {
    return [...this.load().values()];
  }

  find(pred: (t: T) => boolean): T[] {
    return this.all().filter(pred);
  }

  get(id: string): T | undefined {
    return this.load().get(id);
  }

  upsert(item: T): T {
    this.load().set(item.id, item);
    this.persist();
    return item;
  }

  update(id: string, patch: Partial<T>): T | undefined {
    const cur = this.load().get(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch, id } as T;
    this.load().set(id, next);
    this.persist();
    return next;
  }

  remove(id: string): void {
    this.load().delete(id);
    this.persist();
  }
}

/** Stable-ish id generator (no external deps; time is passed in to stay pure). */
export function newId(prefix: string): string {
  const rand = Math.floor(Math.random() * 1e9).toString(36);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}
