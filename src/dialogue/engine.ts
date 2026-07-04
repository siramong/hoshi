import type { EmotionState, SystemContext, PersonalityTraits } from "../types"
import { BehaviorState } from "../types"

const COOLDOWN_MS = 300_000

interface Template {
  category: string
  condition: (e: EmotionState, ctx: SystemContext, p: PersonalityTraits) => boolean
  messages: string[]
}

const TEMPLATES: Template[] = [
  {
    category: "sleeping",
    condition: (_e: EmotionState, _ctx: SystemContext, _p: PersonalityTraits) => true,
    messages: ["💤 zzz...", "zZZ...", "*dormido*", "Zzz..."],
  },
  {
    category: "happy",
    condition: (e: EmotionState, _ctx: SystemContext, _p: PersonalityTraits) => e.happiness > 55,
    messages: ["^_^", "♪", "Hehe~", "Qué bien~", ":D"],
  },
  {
    category: "curious",
    condition: (e: EmotionState, _ctx: SystemContext, _p: PersonalityTraits) => e.curiosity > 50,
    messages: ["¿?", "Hmm...", "Qué es eso?", "Ooooh", "Interesante..."],
  },
  {
    category: "lonely",
    condition: (e: EmotionState, _ctx: SystemContext, _p: PersonalityTraits) => e.loneliness > 65 && e.happiness < 40,
    messages: ["...", "*sigh*", "..."],
  },
  {
    category: "bored",
    condition: (e: EmotionState, _ctx: SystemContext, _p: PersonalityTraits) => e.boredom > 45 && e.energy > 20,
    messages: ["*bostezo*", "...", "Aburrido..."],
  },
  {
    category: "morning_greeting",
    condition: (e: EmotionState, _ctx: SystemContext, _p: PersonalityTraits) => {
      const h = new Date().getHours()
      return h >= 6 && h < 10 && e.happiness > 40
    },
    messages: ["Buenos días~", "Morning!", "Arriba! ☀️", "Día nuevo~"],
  },
  {
    category: "night",
    condition: (_e: EmotionState, _ctx: SystemContext, _p: PersonalityTraits) => {
      const h = new Date().getHours()
      return h >= 22 || h < 5
    },
    messages: ["*sueño*", "Que tarde...", "Hora de dormir..."],
  },
  {
    category: "high_activity",
    condition: (_e: EmotionState, ctx: SystemContext, _p: PersonalityTraits) => ctx.activityLevel === "high" && !ctx.isIdle,
    messages: ["Vas rápido hoy!", "tictactictac", "Uf qué ritmo"],
  },
  {
    category: "idle_long",
    condition: (_e: EmotionState, ctx: SystemContext, _p: PersonalityTraits) => ctx.isIdle && ctx.idleDuration > 120_000,
    messages: ["...?", "Holaa?", "Sigues ahí?"],
  },
  {
    category: "pet",
    condition: (e: EmotionState, _ctx: SystemContext, _p: PersonalityTraits) => e.affection > 45,
    messages: ["Mimimi~", "Quieto ahí", "Otra vez?"],
  },
  {
    category: "curious_personality",
    condition: (_e: EmotionState, ctx: SystemContext, p: PersonalityTraits) => {
      const h = new Date().getHours()
      return h >= 10 && h < 12 && p.curiosity > 55 && ctx.activityLevel === "low"
    },
    messages: ["Qué haces?", "Cuéntame", "Qué hay de nuevo?"],
  },
]

export class DialogueEngine {
  private cooldowns = new Map<string, number>()
  private lastMessages: string[] = []
  private readonly maxRecent = 5
  private tickSinceLastMsg = 0

  getMessage(state: BehaviorState, emotions: EmotionState, context: SystemContext, personality: PersonalityTraits): string | null {
    const now = Date.now()
    const available: Template[] = []

    if (state === BehaviorState.Sleeping) {
      const sleepTpl = TEMPLATES.find((t) => t.category === "sleeping")!
      return this.pick(sleepTpl.messages)
    }

    for (const tpl of TEMPLATES) {
      if (tpl.category === "sleeping") continue
      const lastUsed = this.cooldowns.get(tpl.category) ?? 0
      if (now - lastUsed < COOLDOWN_MS) continue
      if (tpl.condition(emotions, context, personality)) {
        available.push(tpl)
      }
    }

    if (available.length === 0) {
      this.tickSinceLastMsg++
      if (this.tickSinceLastMsg > 120) {
        this.tickSinceLastMsg = 0
        const ambient = ["...", "....", ".....", "......"]
        return this.pick(ambient)
      }
      return null
    }

    this.tickSinceLastMsg = 0

    const weights = available.map(() => Math.random())
    const maxW = Math.max(...weights)
    const chosen = available[weights.indexOf(maxW)]

    this.cooldowns.set(chosen.category, now)
    return this.pick(chosen.messages)
  }

  private pick(messages: string[]): string {
    const pool = messages.filter((m) => !this.lastMessages.includes(m))
    const src = pool.length > 0 ? pool : messages
    const msg = src[Math.floor(Math.random() * src.length)]
    this.lastMessages.push(msg)
    if (this.lastMessages.length > this.maxRecent) {
      this.lastMessages.shift()
    }
    return msg
  }
}