// ─── Emotion types ────────────────────────────────────────────

export interface EmotionState {
  happiness: number
  curiosity: number
  energy: number
  loneliness: number
  anxiety: number
  affection: number
  boredom: number
}

export type EmotionKey = keyof EmotionState

export const EMOTION_KEYS: EmotionKey[] = [
  "happiness",
  "curiosity",
  "energy",
  "loneliness",
  "anxiety",
  "affection",
  "boredom",
]

// ─── Behavior types ───────────────────────────────────────────

export enum BehaviorState {
  Idle = "idle",
  Observing = "observing",
  Happy = "happy",
  Sleeping = "sleeping",
  Curious = "curious",
}

export interface BehaviorRule {
  name: string
  condition: (emotions: EmotionState, context: SystemContext) => boolean
  priority: number
  targetState: BehaviorState
}

// ─── Identity / Personality types ────────────────────────────

export interface PersonalityTraits {
  curiosity: number
  introversion: number
  humor: number
  empathy: number
  discipline: number
  creativity: number
}

export type TraitKey = keyof PersonalityTraits

// ─── Memory types ─────────────────────────────────────────────

export type MemoryType = "event" | "emotion" | "dialogue" | "milestone"

export interface Memory {
  id: string
  timestamp: number
  type: MemoryType
  content: string
  importance: number
  tags: string[]
}

// ─── Event types ──────────────────────────────────────────────

export type SystemEvent =
  | { type: "APP_OPEN"; app: string }
  | { type: "APP_CLOSE"; app: string }
  | { type: "IDLE_START" }
  | { type: "IDLE_END" }
  | { type: "FOCUS_CHANGE"; app: string }
  | { type: "USER_INTERACTION"; kind: "click" | "keyboard" | "mouse" }
  | { type: "PET" }
  | { type: "TICKLE" }
  | { type: "COMPILE_SUCCESS" }
  | { type: "COMPILE_ERROR" }
  | { type: "TICK" }

// ─── Context types ────────────────────────────────────────────

export interface SystemContext {
  timeOfDay: "morning" | "afternoon" | "evening" | "night"
  isIdle: boolean
  idleDuration: number
  activeApp: string | null
  recentEvents: SystemEvent[]
}

// ─── Animation types ──────────────────────────────────────────

export type AnimationKey = "idle" | "happy" | "sleeping" | "surprise" | "observing" | "bounce" | "curious"

export interface AnimationFrame {
  spriteIndex: number
  duration: number
}

// ─── Global state ─────────────────────────────────────────────

export interface Settings {
  showHUD: boolean
}

export interface HoshiState {
  emotions: EmotionState
  behavior: BehaviorState
  personality: PersonalityTraits
  context: SystemContext
  animation: AnimationKey
  forcedAnimation: string | null
  forcedAnimTimer: number
  message: string | null
  settings: Settings
}

export const DEFAULT_SETTINGS: Settings = {
  showHUD: true,
}
