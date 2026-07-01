import { useCallback, useRef } from "react"
import { HoshiCanvas } from "./components/HoshiCanvas"
import { HUD } from "./components/HUD"
import { PixiApp } from "./renderer"
import { EmotionEngine, BehaviorEngine, IdentityEngine, MemoryEngine } from "./engines"
import { SystemObserver } from "./observers"
import { useHoshiStore } from "./store"
import "./App.css"

export function App() {
  const pixiRef = useRef<PixiApp | null>(null)
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

  const handlePixiReady = useCallback((pixi: PixiApp) => {
    pixiRef.current = pixi
  }, [])

  return (
    <div className="app-root">
      <HoshiCanvas onReady={handlePixiReady} />
      <HUD />
    </div>
  )
}
