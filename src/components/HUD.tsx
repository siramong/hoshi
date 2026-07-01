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
  const showHUD = useHoshiStore((s) => s.settings.showHUD)

  if (!showHUD) return null

  return (
    <div style={styles.panel}>
      <span style={styles.title}>Hoshi</span>
      <span style={styles.sep}>|</span>
      <span>{behavior}</span>
      <span style={styles.sep}>|</span>
      <span>{animation}</span>
      <span style={styles.sep}>|</span>
      {EMOTION_KEYS.slice(0, 4).map((key) => (
        <span key={key} style={styles.em}>{key[0].toUpperCase()}{Math.round(emotions[key])}</span>
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    background: "rgba(0,0,0,0.55)",
    color: "#0f0",
    fontFamily: "monospace",
    fontSize: 9,
    padding: "2px 4px",
    zIndex: 9999,
    userSelect: "none",
    pointerEvents: "none",
    display: "flex",
    gap: 2,
    alignItems: "center",
    lineHeight: 1.3,
  },
  title: {
    fontWeight: "bold",
    color: "#fff",
  },
  sep: {
    color: "#555",
    margin: "0 1px",
  },
  em: {
    color: "#adf",
    marginRight: 1,
  },
}
