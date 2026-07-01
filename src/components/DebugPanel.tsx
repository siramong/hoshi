import { useHoshiStore } from "../store"

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
  fontSize: 9,
  lineHeight: "13px",
}

const label: React.CSSProperties = {
  color: "#888",
  whiteSpace: "nowrap",
}

const val: React.CSSProperties = {
  color: "#fff",
  textAlign: "right",
  wordBreak: "break-all",
  maxWidth: 160,
}

export function DebugPanel() {
  const emotions = useHoshiStore((s) => s.emotions)
  const behavior = useHoshiStore((s) => s.behavior)
  const context = useHoshiStore((s) => s.context)
  const personality = useHoshiStore((s) => s.personality)
  const settings = useHoshiStore((s) => s.settings)
  const lastAiAnalysis = useHoshiStore((s) => s.lastAiAnalysis)
  const aiAnalysisCountdown = useHoshiStore((s) => s.aiAnalysisCountdown)

  return (
    <div style={{
      position: "fixed",
      top: 18,
      right: 4,
      zIndex: 9999,
      background: "rgba(0,0,0,0.85)",
      border: "1px solid #444",
      borderRadius: 4,
      padding: "6px 8px",
      fontFamily: "monospace",
      fontSize: 9,
      color: "#ccc",
      minWidth: 200,
      pointerEvents: "none",
    }}>
      <div style={{ color: "#ff79c6", fontWeight: "bold", marginBottom: 4, fontSize: 10 }}>
        ⚙ Hoshi Debug
      </div>

      <div style={row}><span style={label}>AI</span><span style={{ ...val, color: settings.aiEnabled && settings.apiKey ? "#50fa7b" : "#ff5555" }}>{settings.aiEnabled && settings.apiKey ? "ON" : "OFF"}</span></div>
      <div style={row}><span style={label}>Modelo</span><span style={val}>{settings.aiModel ?? "-"}</span></div>
      <div style={row}><span style={label}>API Key</span><span style={val}>{settings.apiKey ? "✓ configurada" : "✗ vacía"}</span></div>
      <div style={row}><span style={label}>Próximo análisis</span><span style={val}>{aiAnalysisCountdown > 0 ? `${aiAnalysisCountdown}s` : "..."}</span></div>

      {lastAiAnalysis && (
        <>
          <div style={{ borderTop: "1px solid #333", margin: "4px 0" }} />
          <div style={{ color: "#8be9fd", fontSize: 10, marginBottom: 2 }}>Último análisis AI</div>
          <div style={row}><span style={label}>Ventana</span><span style={val}>{lastAiAnalysis.windowTitle || "(ninguna)"}</span></div>
          <div style={row}><span style={label}>Ajustes</span><span style={val}>{Object.entries(lastAiAnalysis.adjustments).filter(([, v]) => v).map(([k, v]) => `${k}:${v > 0 ? "+" : ""}${v}`).join(" ") || "(ninguno)"}</span></div>
          {lastAiAnalysis.commentary && <div style={row}><span style={label}>Comentario</span><span style={{ ...val, color: "#f1fa8c" }}>"{lastAiAnalysis.commentary}"</span></div>}
          <div style={row}><span style={label}>Raw</span><span style={{ ...val, color: "#6272a4", fontSize: 8 }}>{lastAiAnalysis.rawResponse.length > 120 ? lastAiAnalysis.rawResponse.slice(0, 120) + "..." : lastAiAnalysis.rawResponse}</span></div>
        </>
      )}

      <div style={{ borderTop: "1px solid #333", margin: "4px 0" }} />
      <div style={{ color: "#f1fa8c", fontSize: 10, marginBottom: 2 }}>Emociones</div>
      {(["happiness", "curiosity", "energy", "loneliness", "anxiety", "affection", "boredom"] as const).map((k) => (
        <div key={k} style={row}>
          <span style={label}>{k}</span>
          <span style={{ ...val, color: emotions[k] > 60 ? "#50fa7b" : emotions[k] < 30 ? "#ff5555" : "#fff" }}>{Math.round(emotions[k])}</span>
        </div>
      ))}

      <div style={{ borderTop: "1px solid #333", margin: "4px 0" }} />
      <div style={{ color: "#8be9fd", fontSize: 10, marginBottom: 2 }}>Comportamiento</div>
      <div style={row}><span style={label}>Estado</span><span style={{ ...val, color: "#50fa7b" }}>{behavior}</span></div>
      <div style={row}><span style={label}>Contexto</span><span style={val}>{context.timeOfDay} | {context.activityLevel} | {context.isIdle ? `idle ${Math.round(context.idleDuration / 1000)}s` : "activo"}</span></div>

      <div style={{ borderTop: "1px solid #333", margin: "4px 0" }} />
      <div style={{ color: "#ff79c6", fontSize: 10, marginBottom: 2 }}>Personalidad</div>
      {(["curiosity", "introversion", "humor", "empathy", "discipline", "creativity"] as const).map((k) => (
        <div key={k} style={row}>
          <span style={label}>{k}</span>
          <span style={val}>{Math.round(personality[k])}</span>
        </div>
      ))}
    </div>
  )
}
