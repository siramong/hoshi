import { type SystemEvent, type SystemContext, type TimeSlot, type ActivityLevel } from "../types"

const WINDOW_MS = 60_000
const HIGH_THRESHOLD = 10
const LOW_THRESHOLD = 2

function getTimeSlot(): TimeSlot {
  const h = new Date().getHours()
  if (h < 6) return "early_morning"
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  if (h < 21) return "evening"
  return "night"
}

function calcActivityLevel(count: number, windowMs: number): ActivityLevel {
  const rate = count / (windowMs / 1000)
  if (rate >= HIGH_THRESHOLD) return "high"
  if (rate >= LOW_THRESHOLD) return "medium"
  return "low"
}

export class SystemObserver {
  private idleDuration = 0
  private isIdle = false
  private activeApp: string | null = null
  private lastActivity = Date.now()
  private readonly idleThreshold = 60_000

  private inputTimestamps: number[] = []
  private currentSlot: TimeSlot = getTimeSlot()

  tick(): SystemEvent[] {
    const now = Date.now()
    const elapsed = now - this.lastActivity
    this.idleDuration = elapsed

    const events: SystemEvent[] = []

    if (elapsed > this.idleThreshold && !this.isIdle) {
      this.isIdle = true
      events.push({ type: "IDLE_START" })
    } else if (elapsed <= this.idleThreshold && this.isIdle) {
      this.isIdle = false
      events.push({ type: "IDLE_END" })
    }

    // activity level
    const cutoff = now - WINDOW_MS
    this.inputTimestamps = this.inputTimestamps.filter((t) => t > cutoff)
    const level = calcActivityLevel(this.inputTimestamps.length, WINDOW_MS)

    if (level === "high") {
      events.push({ type: "HIGH_ACTIVITY" })
    } else if (level === "low" && this.inputTimestamps.length === 0) {
      events.push({ type: "LOW_ACTIVITY" })
    }

    // time slot changes
    const slot = getTimeSlot()
    if (slot !== this.currentSlot) {
      this.currentSlot = slot
      events.push({ type: "TIME_SLOT_CHANGE", slot })
    }

    events.push({ type: "TICK" })
    return events
  }

  reportActivity(): void {
    this.lastActivity = Date.now()
  }

  recordInput(): void {
    this.inputTimestamps.push(Date.now())
    this.lastActivity = Date.now()
  }

  getContext(): SystemContext {
    const now = Date.now()
    const cutoff = now - WINDOW_MS
    const recentInputs = this.inputTimestamps.filter((t) => t > cutoff)
    const level = calcActivityLevel(recentInputs.length, WINDOW_MS)

    return {
      timeOfDay: this.currentSlot,
      isIdle: this.isIdle,
      idleDuration: this.idleDuration,
      activeApp: this.activeApp,
      activityLevel: level,
      recentEvents: [],
    }
  }
}
