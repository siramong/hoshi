import { useEffect, useRef } from "react"
import { PixiApp } from "../renderer"

interface HoshiCanvasProps {
  onReady?: (app: PixiApp) => void
}

/**
 * HoshiCanvas — mounts the PixiJS canvas and exposes the
 * application instance to the parent via onReady callback.
 */
export function HoshiCanvas({ onReady }: HoshiCanvasProps) {
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

  return <canvas ref={canvasRef} style={{ display: "block" }} />
}
