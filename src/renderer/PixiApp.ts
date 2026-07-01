import { Application, Assets, Sprite, Texture } from "pixi.js"
import { applyAnim } from "./animations"

type DirName = "south" | "east" | "north" | "west"

const DIR_NAMES: DirName[] = ["south", "east", "north", "west"]

export class PixiApp {
  readonly app: Application
  private _sprite: Sprite | null = null
  private dirTextures = new Map<DirName, Texture>()
  private idleFrames: Texture[] = []
  private currentDir: DirName = "south"
  private behavior = "idle"
  private prevBehavior = ""
  private frameIndex = 0
  private frameTimer = 0
  private rafId = 0
  private lastTime = 0

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
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
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

  async loadDirections(basePath: string): Promise<void> {
    for (const dir of DIR_NAMES) {
      const tex = await Assets.load(`${basePath}_${dir}.png`)
      this.dirTextures.set(dir, tex)
    }
  }

  async loadIdleFrames(): Promise<void> {
    const paths = [
      "/sprites/animations/breathing-idle/south/0.png",
      "/sprites/animations/breathing-idle/south/1.png",
      "/sprites/animations/breathing-idle/south/2.png",
      "/sprites/animations/breathing-idle/south/3.png",
    ]
    for (const p of paths) {
      const tex = await Assets.load(p)
      this.idleFrames.push(tex)
    }
  }

  setDirection(angleDeg: number): void {
    let dir: DirName
    if (angleDeg < -135 || angleDeg > 135) dir = "west"
    else if (angleDeg < -45) dir = "north"
    else if (angleDeg < 45) dir = "east"
    else dir = "south"
    this.currentDir = dir

    if (!this._sprite) return
    const isIdleLike = this.behavior === "idle" || this.behavior === "observing"
    if (!isIdleLike) {
      const tex = this.dirTextures.get(dir)
      if (tex) this._sprite.texture = tex
    }
  }

  setBehavior(b: string): void {
    this.behavior = b
  }

  startAnimation(): void {
    this.lastTime = performance.now()
    const loop = (now: number) => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.05)
      this.lastTime = now

      if (this._sprite) {
        const isIdleLike = this.behavior === "idle" || this.behavior === "observing"
        const wasIdleLike = this.prevBehavior === "idle" || this.prevBehavior === "observing"

        if (!isIdleLike && wasIdleLike && this.dirTextures.size > 0) {
          const tex = this.dirTextures.get(this.currentDir)
          if (tex) this._sprite.texture = tex
        }

        if (isIdleLike && this.idleFrames.length > 0) {
          this.frameTimer += dt
          if (this.frameTimer > 0.25) {
            this.frameTimer = 0
            this.frameIndex = (this.frameIndex + 1) % this.idleFrames.length
            const tex = this.idleFrames[this.frameIndex]
            if (tex) this._sprite.texture = tex
          }
        }

        this._sprite.scale.set(1.8)
        this._sprite.rotation = 0
        this._sprite.y = 75
        applyAnim(this._sprite, this.behavior, now)
      }

      this.prevBehavior = this.behavior
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
    try {
      this.app.destroy(true)
    } catch {
      // PixiJS 8 ResizePlugin may already be cleaned up
    }
  }
}
