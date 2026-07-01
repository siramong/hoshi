import { Application, Assets, Sprite } from "pixi.js"

export class PixiApp {
  readonly app: Application
  private _sprite: Sprite | null = null

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
