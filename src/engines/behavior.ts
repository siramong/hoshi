import {
  BehaviorState,
  type EmotionState,
  type SystemContext,
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

  evaluate(emotions: EmotionState, context: SystemContext): BehaviorState {
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

    let chosen = BehaviorState.Idle
    let highestPriority = -1

    for (const rule of this.rules) {
      if (rule.condition(emotions, context) && rule.priority > highestPriority) {
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
}
