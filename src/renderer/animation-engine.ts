import { Sprite } from "pixi.js"

export class AnimationEngine {
  private groups = new Map<string, Sprite[]>()
  private activeKey: string | null = null
  private frameIndex = 0
  private frameTimer = 0
  private frameDuration = 280

  register(key: string, frames: Sprite[]): void {
    frames.forEach((s) => (s.visible = false))
    this.groups.set(key, frames)
  }

  tick(behavior: string, direction: string, dt: number): Sprite | null {
    const key = `${behavior}:${direction}`

    if (key !== this.activeKey) {
      if (this.activeKey) {
        this.groups.get(this.activeKey)?.forEach((s) => (s.visible = false))
      }
      this.activeKey = key
      this.frameIndex = 0
      this.frameTimer = 0
    }

    const frames = this.groups.get(key)
    if (!frames || frames.length === 0) return null

    this.frameTimer += dt
    while (this.frameTimer >= this.frameDuration) {
      this.frameTimer -= this.frameDuration
      this.frameIndex = (this.frameIndex + 1) % frames.length
    }

    frames.forEach((s, i) => (s.visible = i === this.frameIndex))
    return frames[this.frameIndex]
  }

  hideAll(): void {
    for (const frames of this.groups.values()) {
      frames.forEach((s) => (s.visible = false))
    }
    this.activeKey = null
    this.frameIndex = 0
    this.frameTimer = 0
  }
}
