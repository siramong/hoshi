import { Sprite } from "pixi.js"

interface AnimGroup {
  frames: Sprite[]
  frameDuration: number
}

export class AnimationEngine {
  private groups = new Map<string, AnimGroup>()
  private activeKey: string | null = null
  private frameIndex = 0
  private frameTimer = 0

  register(key: string, frames: Sprite[], frameDuration = 280): void {
    frames.forEach((s) => (s.visible = false))
    this.groups.set(key, { frames, frameDuration })
  }

  tick(behavior: string, direction: string, dt: number, speedMultiplier = 1): Sprite | null {
    const key = `${behavior}:${direction}`

    if (key !== this.activeKey) {
      if (this.activeKey) {
        const prev = this.groups.get(this.activeKey)
        prev?.frames.forEach((s) => (s.visible = false))
      }
      this.activeKey = key
      this.frameIndex = 0
      this.frameTimer = 0
    }

    const group = this.groups.get(key)
    if (!group || group.frames.length === 0) return null

    const { frames, frameDuration } = group
    const adjustedDuration = frameDuration * speedMultiplier

    this.frameTimer += dt
    while (this.frameTimer >= adjustedDuration) {
      this.frameTimer -= adjustedDuration
      this.frameIndex = (this.frameIndex + 1) % frames.length
    }

    frames.forEach((s, i) => (s.visible = i === this.frameIndex))
    return frames[this.frameIndex]
  }

  hideAll(): void {
    for (const { frames } of this.groups.values()) {
      frames.forEach((s) => (s.visible = false))
    }
    this.activeKey = null
    this.frameIndex = 0
    this.frameTimer = 0
  }
}
