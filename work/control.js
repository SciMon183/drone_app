let telemetryWindow = null;

function startDrone() {
  if (!telemetryWindow || telemetryWindow.closed) {
    telemetryWindow = window.open("telemetry.html", "_blank");

    if (!telemetryWindow) {
      alert("Nie można otworzyć nowego okna. Sprawdź blokowanie popupów.");
    }
  } else {
    telemetryWindow.focus();
  }
}

function sendNotification(message) {
  if (Notification.permission === "granted") {
    new Notification(message);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(message);
      }
    });
  }
}

function landDrone() {
  if (telemetryWindow && !telemetryWindow.closed) {
    telemetryWindow.postMessage({ action: "land" }, window.location.origin);
  }
}

function pauseDrone() {
  if (telemetryWindow && !telemetryWindow.closed) {
    telemetryWindow.postMessage({ action: "pause" }, window.location.origin);
  }
}

function playDrone() {
  if (telemetryWindow && !telemetryWindow.closed) {
    telemetryWindow.postMessage({ action: "play" }, window.location.origin);
  }
}
