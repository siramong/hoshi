import {
  BehaviorState,
  type EmotionState,
  type SystemContext,
  type PersonalityTraits,
  type BehaviorRule,
} from "../types"

const MIN_DURATIONS: Record<BehaviorState, number> = {
  [BehaviorState.Idle]: 3_000,
  [BehaviorState.Observing]: 8_000,
  [BehaviorState.Happy]: 5_000,
  [BehaviorState.Sleeping]: 20_000,
  [BehaviorState.Curious]: 5_000,
}

/**
 * BehaviorEngine — FSM-based decision maker.
 *
 * Evaluates weighted rules each tick to determine
 * Hoshi's current behavior state.
 * Enforces minimum state durations to prevent
 * rapid oscillation.
 */
export class BehaviorEngine {
  private currentState: BehaviorState = BehaviorState.Idle
  private stateEntryTime = Date.now()
  private idleStreakCount = 0
  private readonly rules: BehaviorRule[]

  constructor() {
    this.rules = [
      {
        name: "exhausted",
        priority: 4,
        condition: (e: EmotionState, ctx: SystemContext) =>
          e.energy < 15 || (ctx.timeOfDay === "night" && e.energy < 30),
        targetState: BehaviorState.Sleeping,
      },
      {
        name: "bored_tired",
        priority: 3,
        condition: (e: EmotionState, _ctx: SystemContext) => {
          const streakBonus = this.idleStreakCount > 5 ? 10 : 0
          return e.boredom + streakBonus > 60 && e.energy < 45
        },
        targetState: BehaviorState.Sleeping,
      },
      {
        name: "lonely",
        priority: 2,
        condition: (e: EmotionState, ctx: SystemContext) =>
          e.loneliness > 55 && !ctx.isIdle,
        targetState: BehaviorState.Observing,
      },
      {
        name: "happy",
        priority: 2,
        condition: (e: EmotionState) =>
          e.happiness > 70 || (e.happiness > 55 && e.affection > 50),
        targetState: BehaviorState.Happy,
      },
      {
        name: "curious",
        priority: 1,
        condition: (e: EmotionState, ctx: SystemContext) =>
          e.curiosity > 55 && e.energy > 50 && !ctx.isIdle,
        targetState: BehaviorState.Curious,
      },
    ]
  }

  getState(): BehaviorState {
    return this.currentState
  }

  evaluate(emotions: EmotionState, context: SystemContext, personality?: PersonalityTraits): BehaviorState {
    const now = Date.now()

    if (context.isIdle) {
      this.idleStreakCount++
    } else {
      this.idleStreakCount = 0
    }

    const elapsed = now - this.stateEntryTime
    const minDuration = MIN_DURATIONS[this.currentState]
    if (elapsed < minDuration) {
      return this.currentState
    }

    const effective = personality ? this.applyPersonality(emotions, personality) : emotions

    let chosen = BehaviorState.Idle
    let highestPriority = -1

    for (const rule of this.rules) {
      if (rule.condition(effective, context) && rule.priority > highestPriority) {
        chosen = rule.targetState
        highestPriority = rule.priority
      }
    }

    if (chosen !== this.currentState) {
      this.currentState = chosen
      this.stateEntryTime = now
    }

    return this.currentState
  }

  private applyPersonality(e: EmotionState, p: PersonalityTraits): EmotionState {
    const cap = (v: number) => Math.max(0, Math.min(100, v))
    return {
      curiosity: cap(e.curiosity + (p.curiosity - 50) * 0.2),
      happiness: cap(e.happiness + (p.humor - 50) * 0.2),
      boredom: cap(e.boredom * (1 - (p.discipline - 50) * 0.004)),
      energy: e.energy,
      loneliness: cap(e.loneliness + (p.introversion - 50) * 0.1),
      anxiety: e.anxiety,
      affection: e.affection,
    }
  }
}
