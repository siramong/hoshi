import { create } from "zustand"
import {
  BehaviorState,
  type EmotionState,
  type HoshiState,
  type PersonalityTraits,
  type SystemContext,
} from "../types"

const DEFAULT_EMOTIONS: EmotionState = {
  happiness: 50,
  curiosity: 50,
  energy: 70,
  loneliness: 30,
  anxiety: 20,
  affection: 40,
  boredom: 30,
}

const DEFAULT_TRAITS: PersonalityTraits = {
  curiosity: 50,
  introversion: 40,
  humor: 50,
  empathy: 50,
  discipline: 50,
  creativity: 60,
}

const DEFAULT_CONTEXT: SystemContext = {
  timeOfDay: "morning",
  isIdle: false,
  idleDuration: 0,
  activeApp: null,
  recentEvents: [],
}

interface HoshiStore extends HoshiState {
  setEmotions: (emotions: EmotionState) => void
  setBehavior: (behavior: BehaviorState) => void
  setAnimation: (animation: HoshiState["animation"]) => void
  setForcedAnimation: (anim: string | null, timer?: number) => void
  setContext: (context: SystemContext) => void
  setMessage: (message: string | null) => void
}

export const useHoshiStore = create<HoshiStore>((set) => ({
  emotions: DEFAULT_EMOTIONS,
  behavior: BehaviorState.Idle,
  personality: DEFAULT_TRAITS,
  context: DEFAULT_CONTEXT,
  animation: "idle",
  forcedAnimation: null,
  forcedAnimTimer: 0,
  message: null,

  setEmotions: (emotions) => set({ emotions }),
  setBehavior: (behavior) => set({ behavior }),
  setAnimation: (animation) => set({ animation }),
  setForcedAnimation: (forcedAnimation, timer = 0) => set({ forcedAnimation, forcedAnimTimer: timer }),
  setContext: (context) => set({ context }),
  setMessage: (message) => set({ message }),
}))
