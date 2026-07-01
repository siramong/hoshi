import { useEffect, useRef } from "react"
import { PixiApp } from "../renderer"

interface HoshiCanvasProps {
  onReady?: (app: PixiApp) => void
  onClick?: () => void
}

export function HoshiCanvas({ onReady, onClick }: HoshiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pixiRef = useRef<PixiApp | null>(null)

  useEffect(() => {
    if (!canvasRef.current || pixiRef.current) return

    const pixi = new PixiApp()
    pixiRef.current = pixi

    pixi.init(canvasRef.current).then(() => {
      onReady?.(pixi)
    })

    return () => {
      pixi.destroy()
      pixiRef.current = null
    }
  }, [onReady])

  return (
    <canvas
      ref={canvasRef}
      onClick={onClick}
      style={{ display: "block", cursor: "pointer" }}
    />
  )
}
