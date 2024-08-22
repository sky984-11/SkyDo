/*
 * @Author: liupeng
 * @Description: 
 * @Date: 2024-01-23 16:54:16
 * @LastEditTime: 2024-02-02 10:04:34
 * @FilePath: \SkyDo\ui\src-tauri\src\main.rs
 */


// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};
use tauri_plugin_autostart::MacosLauncher;

#[derive(Clone, serde::Serialize)]
struct Payload {
  args: Vec<String>,
  cwd: String,
}

fn main() {
  let context = tauri::generate_context!();
  
  
  let quit = CustomMenuItem::new("quit".to_string(),"quit"); // 退出菜单
  let tray_menu = SystemTrayMenu::new()
    .add_item(quit)
    .add_native_item(SystemTrayMenuItem::Separator);  // 分割线

  let system_tray = SystemTray::new().with_menu(tray_menu);  
  tauri::Builder::default()
      // 开机自启插件
      .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--flag1", "--flag2"]) /* arbitrary number of args to pass to your app */))
      // 单实例插件
      .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
        println!("{}, {argv:?}, {cwd}", app.package_info().name);

        app.emit_all("single-instance", Payload { args: argv, cwd }).unwrap();
    }))
      .system_tray(system_tray) // ✅ 将 `tauri.conf.json` 上配置的图标添加到系统托盘
      .on_system_tray_event(|app, event| menu_handle(app, event))
      .run(context)
      .expect("error while running OhMyBox application");
}



fn menu_handle(app_handle: &tauri::AppHandle, event: SystemTrayEvent) {
  match event {
    SystemTrayEvent::LeftClick {
      position: _,
      size: _,
      ..
    } => {
      // 鼠标左键切换显示状态
      toggle_window_visibility(app_handle);
      // println!("鼠标-左击");
      
    }
    SystemTrayEvent::RightClick {
      position: _,
      size: _,
      ..
    } => {
      // println!("鼠标-右击");
    }
    SystemTrayEvent::DoubleClick {
      position: _,
      size: _,
      ..
    } => {
      // println!("鼠标-双击");
    }
    SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
      "quit" => {
        std::process::exit(0);
      }
      _ => {}
    },
    _ => {}
  }
}

fn toggle_window_visibility(app_handle: &tauri::AppHandle) {

  let window = app_handle.get_window("main").unwrap();
  if window.is_visible().unwrap() {
    window.hide().unwrap();
  } else {
    window.show().unwrap();
    // 光标定位到程序
    window.set_focus().unwrap();
  }
}