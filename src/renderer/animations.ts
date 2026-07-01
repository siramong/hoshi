import { Sprite } from "pixi.js"

let animTime = 0

export function tickAnimations(sprite: Sprite, behavior: string, dt: number): void {
  animTime += dt

  switch (behavior) {
    case "sleeping":
      breathe(sprite, animTime, 0.5)
      break
    case "happy":
      bounce(sprite, animTime)
      break
    case "curious":
      tilt(sprite, animTime)
      break
    case "observing":
      sway(sprite, animTime)
      break
    default:
      breathe(sprite, animTime, 1)
      blink(sprite, animTime, 3)
      break
  }
}

function breathe(sprite: Sprite, t: number, speed = 1): void {
  const s = 1 + Math.sin(t * Math.PI * speed) * 0.03
  sprite.scale.set(s)
}

function blink(sprite: Sprite, t: number, interval: number): void {
  const cycle = t % interval
  if (cycle < 0.1) {
    sprite.scale.y = 1 - (cycle / 0.1) * 0.3
  } else if (sprite.scale.y < 1) {
    sprite.scale.y = 1
  }
}

function bounce(sprite: Sprite, t: number): void {
  sprite.y += Math.sin(t * Math.PI * 4) * 3
}

function sway(sprite: Sprite, t: number): void {
  sprite.rotation = Math.sin(t * Math.PI * 1.5) * 0.08
}

function tilt(sprite: Sprite, t: number): void {
  sprite.rotation = Math.sin(t * Math.PI * 2.5) * 0.12
}
