import { type Memory, type MemoryType } from "../types"

let _nextId = 0
function generateId(): string {
  return `mem_${Date.now()}_${_nextId++}`
}

/**
 * MemoryEngine — stores structured experiences.
 *
 * Manages four memory types: event, emotion, dialogue, milestone.
 * Supports importance weighting and context-based retrieval.
 */
export class MemoryEngine {
  private memories: Memory[] = []
  private readonly maxMemories = 500

  store(type: MemoryType, content: string, importance: number, tags: string[] = []): Memory {
    const memory: Memory = {
      id: generateId(),
      timestamp: Date.now(),
      type,
      content,
      importance,
      tags,
    }
    this.memories.unshift(memory)
    if (this.memories.length > this.maxMemories) {
      this.memories.pop()
    }
    return memory
  }

  getRecent(count = 20): Memory[] {
    return this.memories.slice(0, count)
  }

  getByType(type: MemoryType): Memory[] {
    return this.memories.filter((m) => m.type === type)
  }

  getImportant(threshold = 70): Memory[] {
    return this.memories.filter((m) => m.importance >= threshold)
  }

  search(query: string): Memory[] {
    const lower = query.toLowerCase()
    return this.memories.filter(
      (m) =>
        m.content.toLowerCase().includes(lower) ||
        m.tags.some((t) => t.toLowerCase().includes(lower))
    )
  }

  getAll(): Memory[] {
    return [...this.memories]
  }

  clear(): void {
    this.memories = []
  }
}
