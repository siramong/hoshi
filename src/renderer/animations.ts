import { Sprite } from "pixi.js"

export function applyAnim(sprite: Sprite, behavior: string, t: number): void {
  switch (behavior) {
    case "idle":
    case "observing":
      sprite.scale.set(3 + Math.sin(t * 0.003) * 0.05)
      break
    case "sleeping":
      sprite.scale.set(3 + Math.sin(t * 0.001) * 0.08)
      break
    case "happy":
      sprite.scale.set(3 + Math.sin(t * 0.006) * 0.04)
      sprite.y = 75 + Math.sin(t * 0.008) * 4
      break
    case "curious":
      sprite.rotation = Math.sin(t * 0.005) * 0.12
      break
  }
}
