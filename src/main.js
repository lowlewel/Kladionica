const { invoke } = window.__TAURI__.core;
const { systemTray } = window.__TAURI__.systemTray; // Assuming systemTray is exposed by the plugin

let greetInputEl;
let greetMsgEl;

async function greet() {
  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}

// System Tray Configuration
const trayConfig = {
  iconPath: '/icons/icon.png', // Placeholder path
  displayName: 'Kladionica',
  statusIconPath: '/icons/status.png', // Placeholder path
};

systemTray.create(trayConfig);

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form").addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
});
