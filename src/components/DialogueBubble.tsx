import { useHoshiStore } from "../store"

export function DialogueBubble() {
  const message = useHoshiStore((s) => s.message)

  if (!message) return null

  return (
    <div style={styles.bubble}>
      <div style={styles.tail} />
      <span style={styles.text}>{message}</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  bubble: {
    position: "fixed",
    top: 4,
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(255,255,255,0.92)",
    padding: "3px 7px",
    borderRadius: 6,
    zIndex: 9998,
    pointerEvents: "none",
    whiteSpace: "nowrap",
  },
  tail: {
    position: "absolute",
    bottom: -4,
    left: "50%",
    marginLeft: -3,
    width: 0,
    height: 0,
    borderLeft: "4px solid transparent",
    borderRight: "4px solid transparent",
    borderTop: "5px solid rgba(255,255,255,0.92)",
  },
  text: {
    color: "#222",
    fontFamily: "monospace",
    fontSize: 9,
    lineHeight: 1.4,
  },
}
