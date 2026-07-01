import { type Memory, type MemoryType } from "../types"
import {
  storeMemory,
  getRecentMemories,
  getMemoriesByType,
  getImportantMemories,
  searchMemories,
  getAllMemories,
  clearMemories,
  deleteOldMemories,
} from "../persist"

let _nextId = 0
function generateId(): string {
  return `mem_${Date.now()}_${_nextId++}`
}

export class MemoryEngine {
  private cache: Memory[] = []
  private cacheSize = 50
  private loaded = false

  async loadFromDB(): Promise<void> {
    if (this.loaded) return
    try {
      this.cache = await getRecentMemories(this.cacheSize)
    } catch {
      this.cache = []
    }
    this.loaded = true
  }

  async store(type: MemoryType, content: string, importance: number, tags: string[] = []): Promise<Memory> {
    const memory: Memory = {
      id: generateId(),
      timestamp: Date.now(),
      type,
      content,
      importance,
      tags,
    }
    this.cache.unshift(memory)
    if (this.cache.length > this.cacheSize) {
      this.cache.pop()
    }
    try {
      await storeMemory(memory.id, memory.timestamp, memory.type, memory.content, memory.importance, memory.tags)
    } catch {
      // DB not available — keep in cache, save later
    }
    return memory
  }

  getRecent(count = 20): Memory[] {
    return this.cache.slice(0, count)
  }

  async getByType(type: MemoryType): Promise<Memory[]> {
    try {
      return await getMemoriesByType(type)
    } catch {
      return this.cache.filter((m) => m.type === type)
    }
  }

  async getImportant(threshold = 70): Promise<Memory[]> {
    try {
      return await getImportantMemories(threshold)
    } catch {
      return this.cache.filter((m) => m.importance >= threshold)
    }
  }

  async search(query: string): Promise<Memory[]> {
    try {
      return await searchMemories(query)
    } catch {
      const lower = query.toLowerCase()
      return this.cache.filter(
        (m) =>
          m.content.toLowerCase().includes(lower) ||
          m.tags.some((t) => t.toLowerCase().includes(lower)),
      )
    }
  }

  async getAll(): Promise<Memory[]> {
    try {
      return await getAllMemories()
    } catch {
      return [...this.cache]
    }
  }

  async clear(): Promise<void> {
    this.cache = []
    try {
      await clearMemories()
    } catch {
      // noop
    }
  }

  async consolidate(): Promise<void> {
    try {
      const deleted = await deleteOldMemories(7 * 24 * 60 * 60 * 1000)
      if (deleted > 0) {
        this.cache = await getRecentMemories(this.cacheSize)
      }
    } catch {
      // noop
    }
  }
}