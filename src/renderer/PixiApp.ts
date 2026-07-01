import { Application, Assets, Sprite, Texture } from "pixi.js"

type DirName = "south" | "east" | "north" | "west"

const DIR_NAMES: DirName[] = ["south", "east", "north", "west"]

export class PixiApp {
  readonly app: Application
  private _sprite: Sprite | null = null
  private dirTextures = new Map<DirName, Texture>()
  private currentDir: DirName = "south"

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
    this._sprite.x = this.app.screen.width / 2
    this._sprite.y = this.app.screen.height / 2
    this._sprite.scale.set(3)
    this.app.stage.addChild(this._sprite)
    return this._sprite
  }

  async loadDirections(basePath: string): Promise<void> {
    for (const dir of DIR_NAMES) {
      const tex = await Assets.load(`${basePath}_${dir}.png`)
      this.dirTextures.set(dir, tex)
    }
  }

  setDirection(angleDeg: number): void {
    if (!this._sprite || this.dirTextures.size === 0) return

    let dir: DirName
    if (angleDeg < -135 || angleDeg > 135) dir = "west"
    else if (angleDeg < -45) dir = "north"
    else if (angleDeg < 45) dir = "east"
    else dir = "south"

    if (dir !== this.currentDir) {
      const tex = this.dirTextures.get(dir)
      if (tex) {
        this._sprite.texture = tex
        this.currentDir = dir
      }
    }
  }

  get sprite(): Sprite | null {
    return this._sprite
  }

  destroy(): void {
    try {
      this.app.destroy(true)
    } catch {
      // PixiJS 8 ResizePlugin may already be cleaned up
    }
  }
}
