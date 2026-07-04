type LogFn = (msg: string, data?: unknown) => void

let _log: LogFn = () => {}

export const debugLog: LogFn = (msg, data) => _log(msg, data)

export function useDebugLogger(enabled: boolean) {
  _log = (msg, data) => {
    if (!enabled) return
    console.log(`%c🐹 Hoshi %c${msg}`, "color:#ff79c6;font-weight:bold", "color:#8be9fd", data ?? "")
  }
}
