import { type PersonalityTraits, type TraitKey, type SystemEvent } from "../types"

const TRAIT_KEYS: TraitKey[] = [
  "curiosity",
  "introversion",
  "humor",
  "empathy",
  "discipline",
  "creativity",
]

const DEFAULT_TRAITS: PersonalityTraits = {
  curiosity: 50,
  introversion: 40,
  humor: 50,
  empathy: 50,
  discipline: 50,
  creativity: 60,
}

/**
 * IdentityEngine — defines who Hoshi is.
 *
 * Traits evolve slowly over time influenced by
 * user behavior patterns. Stabilized via smoothing.
 */
export class IdentityEngine {
  private traits: PersonalityTraits

  constructor() {
    this.traits = { ...DEFAULT_TRAITS }
  }

  getTraits(): PersonalityTraits {
    return { ...this.traits }
  }

  tick(events: SystemEvent[]): void {
    for (const evt of events) {
      switch (evt.type) {
        case "COMPILE_SUCCESS":
          this.adjust("discipline", 0.1)
          this.adjust("curiosity", 0.05)
          break
        case "PET":
          this.adjust("empathy", 0.1)
          this.adjust("humor", 0.05)
          break
        case "TICKLE":
          this.adjust("humor", 0.15)
          break
      }
    }
  }

  private adjust(trait: TraitKey, delta: number): void {
    this.traits[trait] = Math.max(0, Math.min(100, this.traits[trait] + delta))
  }

  reset(): void {
    this.traits = { ...DEFAULT_TRAITS }
  }
}
