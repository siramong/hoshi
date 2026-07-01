import { useCallback, useEffect, useRef, useState } from "react"
import { HoshiCanvas } from "./components/HoshiCanvas"
import { HUD } from "./components/HUD"
import { PixiApp } from "./renderer"
import { tickAnimations } from "./renderer/animations"
import { EmotionEngine, BehaviorEngine, IdentityEngine, MemoryEngine } from "./engines"
import { SystemObserver } from "./observers"
import { useHoshiStore } from "./store"
import { getCurrentWindow } from "@tauri-apps/api/window"
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

  const handleClick = useCallback(() => {
    const { emotion, observer } = enginesRef.current
    observer.reportActivity()
    emotion.setState({ happiness: Math.min(100, emotion.getState().happiness + 10) })
    emotion.setState({ affection: Math.min(100, emotion.getState().affection + 5) })
    setEmotions(emotion.getState())
  }, [setEmotions])

  const [showMenu, setShowMenu] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      getCurrentWindow().startDragging()
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pixi = pixiRef.current
    if (!pixi) return
    const dx = e.clientX - 75
    const dy = e.clientY - 75
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)
    pixi.setDirection(angle)
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setShowMenu((v) => !v)
  }, [])

  const handleClose = useCallback(() => {
    window.close()
  }, [])

  const handlePixiReady = useCallback(async (pixi: PixiApp) => {
    pixiRef.current = pixi
    try {
      await pixi.loadSprite("/sprites/hoshi.png")
      await pixi.loadDirections("/sprites/hoshi")
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

      for (const ev of events) {
        if (ev.type === "IDLE_START") {
          emotion.setState({ boredom: Math.min(100, emotion.getState().boredom + 10), loneliness: Math.min(100, emotion.getState().loneliness + 5) })
        } else if (ev.type === "IDLE_END") {
          emotion.setState({ boredom: Math.max(0, emotion.getState().boredom - 10), loneliness: Math.max(0, emotion.getState().loneliness - 5) })
        }
      }

      if (context.isIdle) {
        emotion.setState({ boredom: Math.min(100, emotion.getState().boredom + 0.5), loneliness: Math.min(100, emotion.getState().loneliness + 0.3) })
      }

      setEmotions(emotion.getState())

      identity.tick(events)

      let emotionsState = emotion.getState()

      if (emotionsState.energy < 30 || context.timeOfDay === "night") {
        emotion.setState({ energy: Math.min(100, emotionsState.energy + 0.5) })
        emotionsState = emotion.getState()
      }

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
    <div className="app-root" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onContextMenu={handleContextMenu}>
      <HoshiCanvas onReady={handlePixiReady} onClick={handleClick} />
      <HUD />
      {showMenu && (
        <div style={menuStyles.container}>
          <button style={menuStyles.btn} onClick={handleClose}>✕ Close</button>
          <button style={menuStyles.btn} onClick={() => setShowMenu(false)}>Hide menu</button>
        </div>
      )}
    </div>
  )
}

const menuStyles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    bottom: 18,
    left: 0,
    display: "flex",
    gap: 1,
    zIndex: 10000,
  },
  btn: {
    background: "rgba(0,0,0,0.7)",
    color: "#fff",
    border: "none",
    fontFamily: "monospace",
    fontSize: 9,
    padding: "2px 6px",
    cursor: "pointer",
    pointerEvents: "auto",
  },
}
