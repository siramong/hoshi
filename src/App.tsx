import { useCallback, useEffect, useRef } from "react"
import { HoshiCanvas } from "./components/HoshiCanvas"
import { HUD } from "./components/HUD"
import { PixiApp } from "./renderer"
import { tickAnimations } from "./renderer/animations"
import { EmotionEngine, BehaviorEngine, IdentityEngine, MemoryEngine } from "./engines"
import { SystemObserver } from "./observers"
import { useHoshiStore } from "./store"
import "./App.css"

export function App() {
  const pixiRef = useRef<PixiApp | null>(null)
  const spriteLoaded = useRef(false)
  const enginesRef = useRef({
    emotion: new EmotionEngine(),
    behavior: new BehaviorEngine(),
    identity: new IdentityEngine(),
    memory: new MemoryEngine(),
    observer: new SystemObserver(),
  })

  const setEmotions = useHoshiStore((s) => s.setEmotions)
  const setBehavior = useHoshiStore((s) => s.setBehavior)
  const setAnimation = useHoshiStore((s) => s.setAnimation)
  const setContext = useHoshiStore((s) => s.setContext)

  const handleClick = useCallback(() => {
    const { emotion, observer } = enginesRef.current
    observer.reportActivity()
    emotion.setState({ happiness: Math.min(100, emotion.getState().happiness + 10) })
    emotion.setState({ affection: Math.min(100, emotion.getState().affection + 5) })
    setEmotions(emotion.getState())
  }, [setEmotions])

  const handlePixiReady = useCallback(async (pixi: PixiApp) => {
    pixiRef.current = pixi
    try {
      await pixi.loadSprite("/sprites/hoshi.png")
      spriteLoaded.current = true
    } catch {
      console.warn("Sprite not found yet — will retry")
    }
  }, [])

  useEffect(() => {
    let lastTick = performance.now()

    const interval = setInterval(() => {
      const now = performance.now()
      const dt = (now - lastTick) / 1000
      lastTick = now

      const { emotion, behavior, identity, memory, observer } = enginesRef.current

      const events = observer.tick()
      const context = observer.getContext()
      setContext(context)

      emotion.tick(events)
      setEmotions(emotion.getState())

      identity.tick(events)

      const emotionsState = emotion.getState()
      const state = behavior.evaluate(emotionsState, context)
      setBehavior(state)

      const animKey =
        state === "sleeping" ? "sleep" :
        state === "happy" ? "happy" :
        state === "curious" ? "curious" :
        state === "observing" ? "observe" :
        "idle"
      setAnimation(animKey)

      const pixi = pixiRef.current
      if (pixi?.sprite) {
        tickAnimations(pixi.sprite, state, dt)
      }

      if (events.some((e) => e.type === "PET" || e.type === "TICKLE" || e.type === "COMPILE_SUCCESS")) {
        memory.store("event", JSON.stringify(events.find(e => e.type !== "TICK")), 50)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [setEmotions, setBehavior, setAnimation, setContext])

  return (
    <div className="app-root">
      <HoshiCanvas onReady={handlePixiReady} onClick={handleClick} />
      <HUD />
    </div>
  )
}
