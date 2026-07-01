import type { EmotionState, PersonalityTraits, Memory } from "../types"

const SAVE_KEY = "hoshi_save"
const VERSION = 1

export interface SaveData {
  version: number
  emotions: EmotionState
  personality: PersonalityTraits
  memory: Memory[]
  sessionCount: number
  lastSave: number
}

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as SaveData
    if (data.version !== VERSION) return null
    return data
  } catch {
    return null
  }
}

export function writeSave(data: Omit<SaveData, "version" | "lastSave">): void {
  try {
    const payload: SaveData = { ...data, version: VERSION, lastSave: Date.now() }
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload))
  } catch {
    // localStorage may be full
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY)
}
