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
        name: "exhausted",
        priority: 4,
        condition: (e: EmotionState, ctx: SystemContext) =>
          e.energy < 15 || (ctx.timeOfDay === "night" && e.energy < 30),
        targetState: BehaviorState.Sleeping,
      },
      {
        name: "bored_tired",
        priority: 3,
        condition: (e: EmotionState) =>
          e.boredom > 60 && e.energy < 45,
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
