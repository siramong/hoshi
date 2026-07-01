import { Application, Assets, Sprite } from "pixi.js"
import { AnimationEngine } from "./animation-engine"

type DirName = "south" | "east" | "north" | "west"

const DIR_NAMES: DirName[] = ["south", "east", "north", "west"]

const ANIM_MAP: Record<string, string> = {
  idle: "breathing-idle",
  observing: "breathing-idle",
}

export class PixiApp {
  readonly app: Application
  private _sprite: Sprite | null = null
  private behavior = "idle"
  private direction: DirName = "south"
  private rafId = 0
  private animEngine = new AnimationEngine()

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

  async loadAnimations(): Promise<void> {
    const animBehaviors = Object.keys(ANIM_MAP)

    for (const behavior of animBehaviors) {
      const folder = ANIM_MAP[behavior]
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
          this.animEngine.register(`${behavior}:${dir}`, frames)
        }
      }
    }
  }

  setDirection(dir: DirName): void {
    this.direction = dir
  }

  setBehavior(b: string): void {
    this.behavior = b
  }

  startAnimation(): void {
    const loop = () => {
      if (this._sprite) {
        const animSprite = this.animEngine.tick(this.behavior, this.direction, 16.67)
        if (animSprite) {
          this._sprite.visible = false
        } else {
          this._sprite.visible = true
          this._sprite.rotation = 0
          this._sprite.scale.set(1.8)
        }
      }
      this.rafId = requestAnimationFrame(loop)
    }
    this.rafId = requestAnimationFrame(loop)
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
