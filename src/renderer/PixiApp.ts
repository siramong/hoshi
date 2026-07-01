import { Application, Assets, Sprite, type Texture } from "pixi.js"

/**
 * PixiApp — manages the PixiJS Application lifecycle.
 *
 * Initialises a transparent canvas that renders Hoshi's
 * sprites and procedural animations on top of the desktop.
 */
export class PixiApp {
  readonly app: Application
  private sprite: Sprite | null = null

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
    })
  }

  async loadSprite(textureOrPath: string | Texture): Promise<Sprite> {
    const texture =
      typeof textureOrPath === "string" ? await Assets.load(textureOrPath) : textureOrPath
    this.sprite = new Sprite(texture)
    this.sprite.anchor.set(0.5)
    this.sprite.x = this.app.screen.width / 2
    this.sprite.y = this.app.screen.height / 2
    this.app.stage.addChild(this.sprite)
    return this.sprite
  }

  getSprite(): Sprite | null {
    return this.sprite
  }

  destroy(): void {
    this.app.destroy(true)
  }
}
