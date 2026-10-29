use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{
    menu::{Menu, MenuItem},
    Manager, State,
    tray::TrayIconBuilder,
};
use tauri_plugin_global_shortcut::GlobalShortcutExt;

#[derive(Serialize, Deserialize, Clone)]
pub struct BetResult {
    pub win: bool,
    pub new_balance: u32,
    pub amount: u32,
}

pub struct AppState {
    pub balance: Mutex<u32>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn place_bet(state: State<'_, AppState>, amount: u32) -> Result<BetResult, String> {
    let mut balance = state.balance.lock().map_err(|_| "Failed to lock balance")?;
    
    if *balance < amount {
        return Err("Insufficient funds!".to_string());
    }

    let won = rand::random::<bool>();
    
    if won {
        *balance += amount;
    } else {
        *balance -= amount;
    }

    Ok(BetResult {
        win: won,
        new_balance: *balance,
        amount,
    })
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(AppState {
            balance: Mutex::new(1000),
        })
        .setup(|app| {
            let show_window = MenuItem::with_id(app, "show_window", "Show Window", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_window, &quit])?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "show_window" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            app.global_shortcut().on_shortcut("CommandOrControl+B", move |app, _shortcut, event| {
                use tauri_plugin_global_shortcut::ShortcutState;
                if event.state() == ShortcutState::Pressed {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }).ok();


            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, place_bet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
