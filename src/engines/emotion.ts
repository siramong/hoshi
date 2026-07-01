import { type EmotionKey, type EmotionState, type SystemEvent, EMOTION_KEYS } from "../types"

/**
 * EmotionEngine — tracks internal emotional state.
 *
 * - Emotions decay toward baseline over time.
 * - External events modify emotion values.
 * - getDominantEmotion() returns the strongest current emotion.
 */
export class EmotionEngine {
  private state: EmotionState
  private readonly decayRates: Record<EmotionKey, number>
  private readonly baselines: EmotionState

  constructor() {
    this.baselines = {
      happiness: 50,
      curiosity: 50,
      energy: 70,
      loneliness: 30,
      anxiety: 20,
      affection: 40,
      boredom: 30,
    }
    this.state = { ...this.baselines }
    this.decayRates = {
      happiness: 0.05,
      curiosity: 0.03,
      energy: 0.1,
      loneliness: 0.04,
      anxiety: 0.06,
      affection: 0.04,
      boredom: 0.05,
    }
  }

  getState(): EmotionState {
    return { ...this.state }
  }

  setState(partial: Partial<EmotionState>): void {
    for (const key of EMOTION_KEYS) {
      const k = key as EmotionKey
      const val = partial[k]
      if (val !== undefined) {
        this.state[k] = Math.max(0, Math.min(100, val))
      }
    }
  }

  tick(events: SystemEvent[]): EmotionState {
    for (const key of EMOTION_KEYS) {
      const k = key as EmotionKey
      const diff = this.baselines[k] - this.state[k]
      if (Math.abs(diff) > 0.5) {
        this.state[k] += Math.sign(diff) * this.decayRates[k]
      }
    }
    return this.getState()
  }

  getDominantEmotion(): EmotionKey {
    let max = -1
    let dominant: EmotionKey = "happiness"
    for (const key of EMOTION_KEYS) {
      if (this.state[key] > max) {
        max = this.state[key]
        dominant = key
      }
    }
    return dominant
  }

  reset(): void {
    this.state = { ...this.baselines }
  }
}
