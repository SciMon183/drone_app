// === control.js ===
const socket = io();

let telemetryWindow = null;

function openTelemetryWindow() {
  if (!telemetryWindow || telemetryWindow.closed) {
    telemetryWindow = window.open("telemetry.html", "_blank");
    if (!telemetryWindow) {
      alert("Nie można otworzyć nowego okna. Sprawdź blokowanie popupów.");
      return;
    }
  } else {
    telemetryWindow.focus();
  }
}

function sendAction(action) {
  if (telemetryWindow && !telemetryWindow.closed) {
    console.log("Wysyłanie akcji:", action);
    telemetryWindow.postMessage({ action }, "*");
  } else {
    console.warn("Okno telemetryczne nie jest dostępne.");
  }
}
