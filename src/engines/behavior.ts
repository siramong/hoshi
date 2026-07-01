import {
  BehaviorState,
  type EmotionState,
  type SystemContext,
  type BehaviorRule,
} from "../types"

/**
 * BehaviorEngine — FSM-based decision maker.
 *
 * Evaluates weighted rules each tick to determine
 * Hoshi's current behavior state.
 */
export class BehaviorEngine {
  private currentState: BehaviorState = BehaviorState.Idle
  private readonly rules: BehaviorRule[]

  constructor() {
    this.rules = [
      {
        name: "sleepy",
        priority: 3,
        condition: (e: EmotionState, ctx: SystemContext) =>
          e.energy < 20 || (ctx.timeOfDay === "night" && e.energy < 40),
        targetState: BehaviorState.Sleeping,
      },
      {
        name: "happy",
        priority: 2,
        condition: (e: EmotionState) => e.happiness > 75,
        targetState: BehaviorState.Happy,
      },
      {
        name: "lonely",
        priority: 2,
        condition: (e: EmotionState, ctx: SystemContext) =>
          e.loneliness > 65 && !ctx.isIdle,
        targetState: BehaviorState.Observing,
      },
      {
        name: "curious",
        priority: 1,
        condition: (e: EmotionState, ctx: SystemContext) =>
          e.curiosity > 60 && !ctx.isIdle,
        targetState: BehaviorState.Curious,
      },
    ]
  }

  getState(): BehaviorState {
    return this.currentState
  }

  evaluate(emotions: EmotionState, context: SystemContext): BehaviorState {
    let chosen = BehaviorState.Idle
    let highestPriority = -1

    for (const rule of this.rules) {
      if (rule.condition(emotions, context) && rule.priority > highestPriority) {
        chosen = rule.targetState
        highestPriority = rule.priority
      }
    }

    this.currentState = chosen
    return chosen
  }
}
