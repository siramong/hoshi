import { sendNotification, isPermissionGranted, requestPermission } from "@tauri-apps/plugin-notification"

export async function notify(title: string, body?: string): Promise<void> {
  try {
    let granted = await isPermissionGranted()
    if (!granted) {
      const permission = await requestPermission()
      granted = permission === "granted"
    }
    if (granted) {
      sendNotification({ title, body })
    }
  } catch { /* not supported */ }
}
