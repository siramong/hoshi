import { Application, Assets, Sprite } from "pixi.js"
import { AnimationEngine } from "./animation-engine"
import type { EmotionState } from "../types"

type DirName = "south" | "east" | "north" | "west"

const DIR_NAMES: DirName[] = ["south", "east", "north", "west"]

const ANIM_MAP: Record<string, string> = {
  idle: "breathing-idle",
  observing: "breathing-idle",
  happy: "happy",
  sleeping: "sleepy",
  curious: "curious",
}

function calcSpeedMultiplier(emotions: EmotionState): number {
  const energy = emotions.energy
  const happiness = emotions.happiness
  const avg = (energy + happiness) / 2
  return 1.3 - (avg / 100) * 0.6
}

export class PixiApp {
  readonly app: Application
  private _sprite: Sprite | null = null
  private behavior = "idle"
  private direction: DirName = "south"
  private rafId = 0
  private animEngine = new AnimationEngine()
  private speedMultiplier = 1

  private blinkSprites = new Map<DirName, Sprite>()
  private blinkTimer = 3000
  private blinkVisible = false
  private blinkElapsed = 0

  constructor() {
    this.app = new Application()
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    await this.app.init({
      canvas,
      width: 150,
      height: 150,
      backgroundAlpha: 0,
      antialias: false,
      resolution: 1,
      autoDensity: false,
      hello: false,
    })
  }

  async loadSprite(path: string): Promise<Sprite> {
    const texture = await Assets.load(path)
    this._sprite = new Sprite(texture)
    this._sprite.anchor.set(0.5)
    this._sprite.x = 75
    this._sprite.y = 75
    this._sprite.scale.set(1.8)
    this.app.stage.addChild(this._sprite)
    return this._sprite
  }

  async loadBlinkSprites(basePath: string): Promise<void> {
    for (const dir of DIR_NAMES) {
      const path = `${basePath}_${dir}.png`
      try {
        const texture = await Assets.load(path)
        const sprite = new Sprite(texture)
        sprite.anchor.set(0.5)
        sprite.x = 75
        sprite.y = 75
        sprite.scale.set(1.8)
        sprite.visible = false
        this.app.stage.addChild(sprite)
        this.blinkSprites.set(dir, sprite)
      } catch {
        // blink sprite not available for this direction
      }
    }
    // Stagger first blink randomly
    this.blinkTimer = 2500 + Math.random() * 1500
  }

  async loadAnimations(): Promise<void> {
    const FRAME_DURATIONS: Record<string, number> = {
      "breathing-idle": 600,
      happy: 400,
      sleepy: 500,
      curious: 450,
    }

    const animBehaviors = Object.keys(ANIM_MAP)

    for (const behavior of animBehaviors) {
      const folder = ANIM_MAP[behavior]
      const frameDuration = FRAME_DURATIONS[folder] ?? 600
      for (const dir of DIR_NAMES) {
        const frames: Sprite[] = []
        for (let i = 0; ; i++) {
          const url = `/sprites/animations/${folder}/${dir}/${i}.png`
          try {
            const texture = await Assets.load(url)
            const sprite = new Sprite(texture)
            sprite.anchor.set(0.5)
            sprite.x = 75
            sprite.y = 75
            sprite.scale.set(1.8)
            sprite.visible = false
            this.app.stage.addChild(sprite)
            frames.push(sprite)
          } catch {
            break
          }
        }
        if (frames.length > 0) {
          this.animEngine.register(`${behavior}:${dir}`, frames, frameDuration)
        }
      }
    }
  }

  setDirection(dir: DirName): void {
    this.direction = dir
  }

  setBehavior(b: string, emotions?: EmotionState): void {
    this.behavior = b
    if (emotions) {
      this.speedMultiplier = calcSpeedMultiplier(emotions)
    }
  }

  startAnimation(): void {
    let prevTime = performance.now()

    const loop = (now: number) => {
      const dt = now - prevTime
      prevTime = now

      if (this._sprite) {
        const animSprite = this.animEngine.tick(this.behavior, this.direction, dt, this.speedMultiplier)
        if (animSprite) {
          this._sprite.visible = false
        } else {
          this._sprite.visible = true
        }

        this.tickBlink(dt)
      }

      this.rafId = requestAnimationFrame(loop)
    }
    this.rafId = requestAnimationFrame(loop)
  }

  private tickBlink(dt: number): void {
    const blinkSprite = this.blinkSprites.get(this.direction)
    if (!blinkSprite) return

    this.blinkElapsed += dt

    if (this.blinkVisible) {
      // Blink duration: ~100ms
      if (this.blinkElapsed >= 100) {
        blinkSprite.visible = false
        this.blinkVisible = false
        this.blinkTimer = 2500 + Math.random() * 1500
        this.blinkElapsed = 0
      }
    } else {
      if (this.blinkElapsed >= this.blinkTimer) {
        blinkSprite.visible = true
        this.blinkVisible = true
        this.blinkElapsed = 0
      }
    }
  }

  stopAnimation(): void {
    cancelAnimationFrame(this.rafId)
    this.rafId = 0
  }

  get sprite(): Sprite | null {
    return this._sprite
  }

  destroy(): void {
    this.stopAnimation()
    this.animEngine.hideAll()
    try {
      this.app.destroy(true)
    } catch {
      // PixiJS 8 ResizePlugin may already be cleaned up
    }
  }
}
