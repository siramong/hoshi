import { type PersonalityTraits, type TraitKey, type SystemEvent } from "../types"

const DEFAULT_TRAITS: PersonalityTraits = {
  curiosity: 50,
  introversion: 40,
  humor: 50,
  empathy: 50,
  discipline: 50,
  creativity: 60,
}

const DECAY_RATES: Record<TraitKey, number> = {
  curiosity: 0.02,
  introversion: 0.015,
  humor: 0.02,
  empathy: 0.02,
  discipline: 0.015,
  creativity: 0.025,
}

export class IdentityEngine {
  private traits: PersonalityTraits

  constructor() {
    this.traits = { ...DEFAULT_TRAITS }
  }

  getTraits(): PersonalityTraits {
    return { ...this.traits }
  }

  tick(events: SystemEvent[]): void {
    for (const key of Object.keys(DEFAULT_TRAITS) as TraitKey[]) {
      const diff = DEFAULT_TRAITS[key] - this.traits[key]
      if (Math.abs(diff) > 1) {
        this.traits[key] += Math.sign(diff) * DECAY_RATES[key]
      }
    }

    for (const evt of events) {
      switch (evt.type) {
        case "COMPILE_SUCCESS":
          this.adjust("discipline", 0.15)
          this.adjust("curiosity", 0.1)
          break
        case "PET":
          this.adjust("empathy", 0.15)
          this.adjust("humor", 0.1)
          break
        case "TICKLE":
          this.adjust("humor", 0.2)
          break
        case "HIGH_ACTIVITY":
          this.adjust("discipline", 0.1)
          this.adjust("curiosity", 0.05)
          break
        case "USER_INTERACTION":
          this.adjust("empathy", 0.03)
          this.adjust("introversion", -0.02)
          break
        case "IDLE_START":
          this.adjust("introversion", 0.05)
          break
        case "TIME_SLOT_CHANGE":
          if (evt.slot === "night" || evt.slot === "early_morning") {
            this.adjust("creativity", 0.1)
          }
          break
      }
    }
  }

  private adjust(trait: TraitKey, delta: number): void {
    this.traits[trait] = Math.max(0, Math.min(100, this.traits[trait] + delta))
  }

  loadTraits(traits: PersonalityTraits): void {
    this.traits = { ...traits }
  }

  reset(): void {
    this.traits = { ...DEFAULT_TRAITS }
  }
}