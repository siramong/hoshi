import { useHoshiStore } from "../store"
import { EMOTION_KEYS } from "../types"

/**
 * HUD — debug overlay showing Hoshi's internal state.
 *
 * Renders emotion values, current behavior state, and
 * animation key in a semi-transparent panel.
 */
export function HUD() {
  const emotions = useHoshiStore((s) => s.emotions)
  const behavior = useHoshiStore((s) => s.behavior)
  const animation = useHoshiStore((s) => s.animation)

  return (
    <div style={styles.panel}>
      <div style={styles.title}>Hoshi v0.1</div>
      <div>State: {behavior}</div>
      <div>Anim: {animation}</div>
      {EMOTION_KEYS.map((key) => (
        <div key={key}>
          {key}: {Math.round(emotions[key])}
        </div>
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    background: "rgba(0,0,0,0.7)",
    color: "#0f0",
    fontFamily: "monospace",
    fontSize: 11,
    padding: "6px 10px",
    zIndex: 9999,
    userSelect: "none",
    pointerEvents: "none",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
    color: "#fff",
  },
}
