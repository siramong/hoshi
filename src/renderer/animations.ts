import { Sprite } from "pixi.js"

/**
 * Procedural animation helpers for Hoshi.
 *
 * Each function mutates the sprite's transform over time
 * based on a 0‑1 progress value.
 */

export function breathe(sprite: Sprite, progress: number): void {
  const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.02
  sprite.scale.set(scale)
}

export function blink(sprite: Sprite, progress: number, interval: number): void {
  const cycle = progress % interval
  if (cycle < 0.1) {
    sprite.scale.y = 1 - cycle / 0.1
  } else {
    sprite.scale.y = 1
  }
}

export function bounce(sprite: Sprite, progress: number): void {
  sprite.y = sprite.y + Math.sin(progress * Math.PI * 2) * 3
}

export function sway(sprite: Sprite, progress: number): void {
  sprite.rotation = Math.sin(progress * Math.PI * 2) * 0.05
}
