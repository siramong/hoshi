import { type SystemEvent, type SystemContext } from "../types"

/**
 * SystemObserver — monitors user activity locally.
 *
 * Tracks active applications, idle time, and interaction
 * patterns. Emits SystemEvents for the engines to consume.
 *
 * Privacy-first: no data leaves the device.
 */
export class SystemObserver {
  private idleDuration = 0
  private isIdle = false
  private activeApp: string | null = null
  private lastActivity = Date.now()
  private readonly idleThreshold = 60_000

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

    events.push({ type: "TICK" })
    return events
  }

  reportActivity(): void {
    this.lastActivity = Date.now()
  }

  getContext(): SystemContext {
    const hour = new Date().getHours()
    const timeOfDay =
      hour < 6 ? "night" : hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"

    return {
      timeOfDay,
      isIdle: this.isIdle,
      idleDuration: this.idleDuration,
      activeApp: this.activeApp,
      recentEvents: [],
    }
  }
}
