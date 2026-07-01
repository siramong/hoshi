import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart"

export async function isAutoStart(): Promise<boolean> {
  try {
    return await isEnabled()
  } catch {
    return false
  }
}

export async function setAutoStart(enabled: boolean): Promise<void> {
  try {
    if (enabled) await enable()
    else await disable()
  } catch { /* not supported on this platform */ }
}
