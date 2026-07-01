import { useCallback, useEffect, useRef, useState } from "react"
import { HoshiCanvas } from "./components/HoshiCanvas"
import { HUD } from "./components/HUD"
import { PixiApp } from "./renderer"
import { EmotionEngine, BehaviorEngine, IdentityEngine, MemoryEngine } from "./engines"
import { SystemObserver } from "./observers"
import { useHoshiStore } from "./store"
import { getCurrentWindow } from "@tauri-apps/api/window"
import "./App.css"

const cap = (v: number) => Math.max(0, Math.min(100, v))

export function App() {
  const pixiRef = useRef<PixiApp | null>(null)
  const enginesRef = useRef({
    emotion: new EmotionEngine(),
    behavior: new BehaviorEngine(),
    identity: new IdentityEngine(),
    memory: new MemoryEngine(),
    observer: new SystemObserver(),
  })
  const userEventsRef = useRef<Array<{ type: "USER_INTERACTION"; kind: "mouse" | "keyboard" }>>([])

  const setEmotions = useHoshiStore((s) => s.setEmotions)
  const setBehavior = useHoshiStore((s) => s.setBehavior)
  const setAnimation = useHoshiStore((s) => s.setAnimation)
  const setContext = useHoshiStore((s) => s.setContext)
  const [showMenu, setShowMenu] = useState(false)

  const handleClick = useCallback(() => {
    const { emotion, observer } = enginesRef.current
    observer.reportActivity()
    emotion.setState({ happiness: cap(emotion.getState().happiness + 15), affection: cap(emotion.getState().affection + 8) })
    setEmotions(emotion.getState())
  }, [setEmotions])

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
    getCurrentWindow().close()
  }, [])

  const handlePixiReady = useCallback(async (pixi: PixiApp) => {
    pixiRef.current = pixi
    try {
      await pixi.loadSprite("/sprites/hoshi.png")
      await pixi.loadDirections("/sprites/hoshi")
      await pixi.loadIdleFrames()
    } catch {
      console.warn("Sprite not found yet — will retry")
    }
    pixi.startAnimation()
  }, [])

  useEffect(() => {
    let lastInput = 0
    const onInput = () => {
      const now = Date.now()
      if (now - lastInput > 1000) {
        lastInput = now
        enginesRef.current.observer.reportActivity()
        userEventsRef.current.push({ type: "USER_INTERACTION", kind: "mouse" })
      }
    }
    document.addEventListener("mousemove", onInput, { passive: true })
    document.addEventListener("keydown", onInput, { passive: true })
    return () => {
      document.removeEventListener("mousemove", onInput)
      document.removeEventListener("keydown", onInput)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const { emotion, behavior, identity, memory, observer } = enginesRef.current

      const events = observer.tick()
      const context = observer.getContext()
      setContext(context)

      const userEvents = userEventsRef.current.splice(0)
      const allEvents = [...events, ...userEvents]

      emotion.tick(allEvents)

      for (const ev of allEvents) {
        if (ev.type === "IDLE_START") {
          emotion.setState({ boredom: cap(emotion.getState().boredom + 10), loneliness: cap(emotion.getState().loneliness + 5) })
        } else if (ev.type === "IDLE_END") {
          emotion.setState({ boredom: cap(emotion.getState().boredom - 10), loneliness: cap(emotion.getState().loneliness - 5) })
        } else if (ev.type === "USER_INTERACTION") {
          emotion.setState({ curiosity: cap(emotion.getState().curiosity + 2), energy: cap(emotion.getState().energy + 1), loneliness: cap(emotion.getState().loneliness - 1.5) })
        }
      }

      if (context.isIdle && context.idleDuration > 120_000) {
        const rate = context.idleDuration > 300_000 ? 2 : 1
        emotion.setState({ boredom: cap(emotion.getState().boredom + rate), loneliness: cap(emotion.getState().loneliness + rate * 0.5) })
      }

      if (context.timeOfDay === "night") {
        emotion.setState({ energy: cap(emotion.getState().energy - 1) })
      } else if (context.timeOfDay === "morning") {
        emotion.setState({ happiness: cap(emotion.getState().happiness + 0.3) })
      }

      let emotionsState = emotion.getState()
      const state = behavior.evaluate(emotionsState, context)

      if (state === "sleeping") {
        emotion.setState({ energy: cap(emotion.getState().energy + 2) })
        emotionsState = emotion.getState()
      }

      setEmotions(emotionsState)
      identity.tick(allEvents)
      setBehavior(state)

      const animKey =
        state === "sleeping" ? "sleep" :
        state === "happy" ? "happy" :
        state === "curious" ? "curious" :
        state === "observing" ? "observe" :
        "idle"
      setAnimation(animKey)

      const pixi = pixiRef.current
      if (pixi) pixi.setBehavior(state)

      if (events.some((e) => e.type !== "TICK" && e.type !== "USER_INTERACTION")) {
        const important = allEvents.find((e) => e.type !== "TICK" && e.type !== "USER_INTERACTION")
        if (important) memory.store("event", JSON.stringify(important), 50)
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
