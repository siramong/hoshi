import Database from "@tauri-apps/plugin-sql"
import type { Memory, MemoryType } from "../types"

let _db: Database | null = null

export async function initDB(): Promise<Database> {
  if (_db) return _db
  _db = await Database.load("sqlite:hoshi.db")
  await _db.execute(`
    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      timestamp INTEGER NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      importance REAL NOT NULL DEFAULT 50,
      tags TEXT DEFAULT '[]'
    )
  `)
  return _db
}

function db(): Database {
  if (!_db) throw new Error("DB not initialized — call initDB() first")
  return _db
}

function parseTags(raw: string): string[] {
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export async function storeMemory(
  id: string,
  timestamp: number,
  type: MemoryType,
  content: string,
  importance: number,
  tags: string[],
): Promise<void> {
  await db().execute(
    "INSERT OR REPLACE INTO memories (id, timestamp, type, content, importance, tags) VALUES ($1, $2, $3, $4, $5, $6)",
    [id, timestamp, type, content, importance, JSON.stringify(tags)],
  )
}

export async function getRecentMemories(limit = 50): Promise<Memory[]> {
  const rows = await db().select<Record<string, unknown>[]>(
    "SELECT * FROM memories ORDER BY timestamp DESC LIMIT $1",
    [limit],
  )
  return rows.map(memoryFromRow)
}

export async function getMemoriesByType(type: MemoryType): Promise<Memory[]> {
  const rows = await db().select<Record<string, unknown>[]>(
    "SELECT * FROM memories WHERE type = $1 ORDER BY timestamp DESC",
    [type],
  )
  return rows.map(memoryFromRow)
}

export async function getImportantMemories(threshold = 70): Promise<Memory[]> {
  const rows = await db().select<Record<string, unknown>[]>(
    "SELECT * FROM memories WHERE importance >= $1 ORDER BY importance DESC LIMIT 100",
    [threshold],
  )
  return rows.map(memoryFromRow)
}

export async function searchMemories(query: string): Promise<Memory[]> {
  const pattern = `%${query}%`
  const rows = await db().select<Record<string, unknown>[]>(
    "SELECT * FROM memories WHERE content LIKE $1 OR tags LIKE $1 ORDER BY timestamp DESC LIMIT 50",
    [pattern],
  )
  return rows.map(memoryFromRow)
}

export async function getAllMemories(): Promise<Memory[]> {
  const rows = await db().select<Record<string, unknown>[]>(
    "SELECT * FROM memories ORDER BY timestamp DESC",
  )
  return rows.map(memoryFromRow)
}

export async function clearMemories(): Promise<void> {
  await db().execute("DELETE FROM memories")
}

export async function deleteOldMemories(maxAgeMs: number): Promise<number> {
  const cutoff = Date.now() - maxAgeMs
  const result = await db().execute(
    "DELETE FROM memories WHERE importance < 30 AND timestamp < $1",
    [cutoff],
  )
  return result.rowsAffected
}

function memoryFromRow(row: Record<string, unknown>): Memory {
  return {
    id: row.id as string,
    timestamp: row.timestamp as number,
    type: row.type as MemoryType,
    content: row.content as string,
    importance: row.importance as number,
    tags: parseTags(row.tags as string),
  }
}