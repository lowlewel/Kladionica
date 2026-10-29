const { invoke } = window.__TAURI__.core;
const { isPermissionGranted, requestPermission, sendNotification } = window.__TAURI__.notification;

let balanceEl;
let gameMsgEl;
let betAmountEl;

async function checkNotificationPermission() {
  let permission = await isPermissionGranted();
  if (!permission) {
    const permissionResponse = await requestPermission();
    permission = permissionResponse === 'granted';
  }
  return permission;
}

async function notify(title, body) {
  if (await checkNotificationPermission()) {
    sendNotification({ title, body });
  }
}

async function placeBet(event) {
  event.preventDefault();
  
  const amount = parseInt(betAmountEl.value, 10);
  if (isNaN(amount) || amount <= 0) {
    gameMsgEl.textContent = "Please enter a valid amount.";
    return;
  }

  try {
    const result = await invoke("place_bet", { amount });
    
    // Update UI
    balanceEl.textContent = result.new_balance;
    
    if (result.win) {
      gameMsgEl.textContent = `WIN! You won $${result.amount}!`;
      gameMsgEl.parentElement.className = "status-card win";
      notify("🎰 BIG WIN! 🎰", `You won $${result.amount}!`);
    } else {
      gameMsgEl.textContent = `LOSS. You lost $${result.amount}.`;
      gameMsgEl.parentElement.className = "status-card loss";
    }
  } catch (err) {
    gameMsgEl.textContent = `Error: ${err}`;
    gameMsgEl.parentElement.className = "status-card error";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  balanceEl = document.querySelector("#balance-val");
  gameMsgEl = document.querySelector("#game-msg");
  betAmountEl = document.querySelector("#bet-amount");
  
  document.querySelector("#bet-form").addEventListener("submit", placeBet);
});
