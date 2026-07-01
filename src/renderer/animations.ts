import { Sprite } from "pixi.js"

export function applyAnim(sprite: Sprite, behavior: string, t: number, base: number): void {
  sprite.rotation = 0
  sprite.y = 75

  switch (behavior) {
    case "idle":
    case "observing":
      sprite.scale.set(base + Math.sin(t * 0.003) * 0.05)
      break
    case "sleeping":
      sprite.scale.set(base + Math.sin(t * 0.001) * 0.08)
      break
    case "happy":
      sprite.scale.set(base + Math.sin(t * 0.006) * 0.04)
      sprite.y = 75 + Math.sin(t * 0.008) * 4
      break
    case "curious":
      sprite.scale.set(base + Math.sin(t * 0.004) * 0.03)
      break
    default:
      sprite.scale.set(base)
  }
}
