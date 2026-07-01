#[tauri::command]
fn get_active_window() -> String {
    unsafe {
        let hwnd = windows_sys::Win32::UI::WindowsAndMessaging::GetForegroundWindow();
        if hwnd == 0 {
            return String::new();
        }
        let mut buf = [0u16; 512];
        let len = windows_sys::Win32::UI::WindowsAndMessaging::GetWindowTextW(
            hwnd,
            buf.as_mut_ptr(),
            buf.len() as i32,
        );
        if len > 0 {
            String::from_utf16_lossy(&buf[..len as usize])
        } else {
            String::new()
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![get_active_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
