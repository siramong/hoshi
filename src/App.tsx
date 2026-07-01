import { useCallback, useEffect, useRef, useState } from "react"
import { HoshiCanvas } from "./components/HoshiCanvas"
import { HUD } from "./components/HUD"
import { DialogueBubble } from "./components/DialogueBubble"
import { PixiApp } from "./renderer"
import { EmotionEngine, BehaviorEngine, IdentityEngine, MemoryEngine } from "./engines"
import { DialogueEngine } from "./dialogue"
import { OpenRouterProvider } from "./ai"
import { SystemObserver } from "./observers"
import { useHoshiStore } from "./store"
import { getCurrentWindow } from "@tauri-apps/api/window"
import "./App.css"

import type { BehaviorState } from "./types"
import { loadSave, writeSave, initDB } from "./persist"

const cap = (v: number) => Math.max(0, Math.min(100, v))

export function App() {
  const pixiRef = useRef<PixiApp | null>(null)
  const enginesRef = useRef({
    emotion: new EmotionEngine(),
    behavior: new BehaviorEngine(),
    identity: new IdentityEngine(),
    memory: new MemoryEngine(),
    observer: new SystemObserver(),
    dialogue: new DialogueEngine(),
    ai: new OpenRouterProvider(),
  })
  const userEventsRef = useRef<Array<{ type: "USER_INTERACTION"; kind: "mouse" | "keyboard" }>>([])

  const setEmotions = useHoshiStore((s) => s.setEmotions)
  const setBehavior = useHoshiStore((s) => s.setBehavior)
  const setAnimation = useHoshiStore((s) => s.setAnimation)
  const setForcedAnimation = useHoshiStore((s) => s.setForcedAnimation)
  const setContext = useHoshiStore((s) => s.setContext)
  const setMessage = useHoshiStore((s) => s.setMessage)
  const setSettings = useHoshiStore((s) => s.setSettings)
  const settings = useHoshiStore((s) => s.settings)
  const [showMenu, setShowMenu] = useState(false)
  const msgCooldownRef = useRef(0)
  const syncSettings = (partial: Partial<typeof settings>) => {
    const merged = { ...useHoshiStore.getState().settings, ...partial }
    localStorage.setItem("hoshi_settings", JSON.stringify(merged))
  }

  const forceAnim = useCallback((anim: string, durationMs: number) => {
    setForcedAnimation(anim, durationMs)
  }, [setForcedAnimation])

  const handleClick = useCallback(() => {
    const { emotion, observer } = enginesRef.current
    observer.reportActivity()
    emotion.setState({ happiness: cap(emotion.getState().happiness + 15), affection: cap(emotion.getState().affection + 8) })
    setEmotions(emotion.getState())
    forceAnim("happy", 2000)
  }, [setEmotions, forceAnim])

  const handleDoubleClick = useCallback(() => {
    const { emotion, observer } = enginesRef.current
    observer.reportActivity()
    emotion.setState({ happiness: cap(emotion.getState().happiness + 20), affection: cap(emotion.getState().affection + 15) })
    setEmotions(emotion.getState())
    forceAnim("happy", 2500)
    setMessage("OwO")
  }, [setEmotions, setMessage, forceAnim])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      getCurrentWindow().startDragging()
    }
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
      await pixi.loadAnimations()
      await pixi.loadBlinkSprites("/sprites/animations/blink/hoshi")
    } catch {
      console.warn("Sprite not found yet — will retry")
    }
    requestAnimationFrame(() => pixi.startAnimation())
  }, [])

  useEffect(() => {
    initDB().then(() => enginesRef.current.memory.loadFromDB()).catch(() => {
      // SQLite not available — memory works from cache only
    })

    const saved = loadSave()
    if (saved) {
      const { emotion, identity } = enginesRef.current
      emotion.setState(saved.emotions)
      identity.loadTraits(saved.personality)
    }
    try {
      const raw = localStorage.getItem("hoshi_settings")
      if (raw) {
        const parsed = JSON.parse(raw)
        setSettings(parsed)
        if (parsed.apiKey) {
          enginesRef.current.ai.configure(parsed.apiKey, parsed.aiModel)
        }
      }
    } catch { /* ignore */ }
  }, [setSettings])

  useEffect(() => {
    let lastInput = 0
    const onInput = () => {
      const now = Date.now()
      if (now - lastInput > 1000) {
        lastInput = now
        enginesRef.current.observer.recordInput()
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

      emotion.tick(allEvents, context)

      let emotionsState = emotion.getState()
      const state = behavior.evaluate(emotionsState, context, identity.getTraits())

      if (state === "sleeping") {
        emotion.setState({ energy: cap(emotion.getState().energy + 2) })
        emotionsState = emotion.getState()
      }

      setEmotions(emotionsState)
      identity.tick(allEvents)
      setBehavior(state)

      let pixi = pixiRef.current
      let effectiveState = state

      const store = useHoshiStore.getState()
      if (store.forcedAnimation && store.forcedAnimTimer > 0) {
        effectiveState = store.forcedAnimation as BehaviorState
        const remaining = store.forcedAnimTimer - 1000
        setForcedAnimation(remaining > 0 ? effectiveState : null, Math.max(0, remaining))
      }

      const animKey =
        state === "sleeping" ? "sleeping" :
        state === "happy" ? "happy" :
        state === "curious" ? "curious" :
        state === "observing" ? "observing" :
        "idle"
      setAnimation(animKey)

      if (pixi) pixi.setBehavior(effectiveState, emotionsState)

      if (msgCooldownRef.current > 0) {
        msgCooldownRef.current--
      } else {
        const msg = enginesRef.current.dialogue.getMessage(state, emotionsState, context, identity.getTraits())
        if (msg) {
          setMessage(msg)
          msgCooldownRef.current = 15 + Math.floor(Math.random() * 15)
        }
      }

      if (events.some((e) => e.type !== "TICK" && e.type !== "USER_INTERACTION")) {
        const important = allEvents.find((e) => e.type !== "TICK" && e.type !== "USER_INTERACTION")
        if (important) memory.store("event", JSON.stringify(important), 50).catch(() => {})
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [setEmotions, setBehavior, setAnimation, setContext])

  useEffect(() => {
    let tickCount = 0
    const saveInterval = setInterval(() => {
      const { emotion, identity, memory } = enginesRef.current

      tickCount++
      if (tickCount % 20 === 0) {
        memory.consolidate().catch(() => {})
      }

      writeSave({
        emotions: emotion.getState(),
        personality: identity.getTraits(),
        memory: [],
        sessionCount: 0,
      })
    }, 30000)

    const onUnload = () => {
      const { emotion, identity } = enginesRef.current
      const settings = useHoshiStore.getState().settings
      localStorage.setItem("hoshi_settings", JSON.stringify(settings))
      writeSave({
        emotions: emotion.getState(),
        personality: identity.getTraits(),
        memory: [],
        sessionCount: 0,
      })
    }
    window.addEventListener("beforeunload", onUnload)

    return () => {
      clearInterval(saveInterval)
      window.removeEventListener("beforeunload", onUnload)
    }
  }, [])

  return (
    <div className="app-root" onMouseDown={handleMouseDown} onContextMenu={handleContextMenu}>
      <HoshiCanvas onReady={handlePixiReady} onClick={handleClick} onDoubleClick={handleDoubleClick} />
      <DialogueBubble />
      <HUD />
      {showMenu && (
        <div style={menuStyles.container}>
          <button style={menuStyles.btn} onClick={() => { setSettings({ showHUD: !settings.showHUD }); syncSettings({ showHUD: !settings.showHUD }) }}>
            {settings.showHUD ? "Hide" : "Show"} HUD
          </button>
          <button style={menuStyles.btn} onClick={() => { const e = document.getElementById("ai-key-input"); if (e) { const v = (e as HTMLInputElement).value; if (v) { setSettings({ apiKey: v, aiEnabled: true }); syncSettings({ apiKey: v, aiEnabled: true }); enginesRef.current.ai.configure(v) } } }}>
            Set API Key
          </button>
          <input id="ai-key-input" type="password" placeholder={settings.apiKey ? "••• key set" : "OpenRouter key"} style={menuStyles.input} />
          <button style={menuStyles.btn} onClick={() => { setSettings({ aiEnabled: !settings.aiEnabled }); syncSettings({ aiEnabled: !settings.aiEnabled }) }}>
            AI: {settings.aiEnabled ? "ON" : "OFF"}
          </button>
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
    alignItems: "center",
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
  input: {
    background: "rgba(0,0,0,0.7)",
    color: "#fff",
    border: "1px solid #555",
    fontFamily: "monospace",
    fontSize: 9,
    padding: "2px 6px",
    width: 120,
    outline: "none",
  },
}
