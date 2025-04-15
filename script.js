const socket = io();

// ELEMENTY DOM
const speedElement = document.getElementById("speed");
const heightElement = document.getElementById("hight");
const batteryElement = document.getElementById("battery");
const gpsElement = document.getElementById("gps");

// ZMIENNE STANU
let currentSpeed = 0;
let currentHeight = 0;
let currentBattery = 88;
let currentGpsValue = 4;

let startTime = null;
let speedStartTime = null;
let lastBatteryDropTime = 0;
let lastSpeedUpdateTime = 0;
let lastSatelliteValue = 0;
let playMode = false;
let rampDuration = 2900;
let interval = 320;
let telemetryInterval = null;

// --- Formatowanie prędkości
function formatSpeed(speed) {
  let rounded = speed.toFixed(2);
  let parts = rounded.split(".");
  let integerPart = parseInt(parts[0]);
  let decimalPart = parts[1];

  if (integerPart < 10) {
    return integerPart + "," + decimalPart;
  } else {
    return integerPart + "," + decimalPart.charAt(0);
  }
}

// --- Główna funkcja aktualizująca telemetrię
function updateTelemetry() {
  let now = Date.now();
  let elapsed = now - startTime;

  // Wysokość
  if (elapsed < 6000) {
    currentHeight = (elapsed / 6000) * 7;
  } else {
    currentHeight = 7;
  }
  heightElement.innerText = "Height: " + currentHeight.toFixed(2) + " m";

  // Satelity GPS
  if (elapsed < 15000) {
    let progress = elapsed / 15000;
    let satellite = Math.floor(4 + progress * 5);
    if (satellite !== lastSatelliteValue) {
      gpsElement.innerText = "Satelite number: " + satellite;
      lastSatelliteValue = satellite;
    }
  } else {
    if (lastSatelliteValue !== 9) {
      gpsElement.innerText = "Satelite number: 9";
      lastSatelliteValue = 9;
    }
  }

  // Prędkość
  if (currentHeight >= 6.5 && speedStartTime === null) {
    speedStartTime = now;
  }

  if (speedStartTime !== null && playMode) {
    let speedElapsed = now - speedStartTime;
    if (speedElapsed < rampDuration) {
      currentSpeed = (speedElapsed / rampDuration) * 10;
    } else if (now - lastSpeedUpdateTime >= 900) {
      let randomOscillation = (Math.random() - 0.5) * 0.45;
      currentSpeed = 10 + randomOscillation;
      currentSpeed = Math.max(9.5, Math.min(11, currentSpeed));
      lastSpeedUpdateTime = now;
    }
    speedElement.innerText = "Speed: " + formatSpeed(currentSpeed) + " km/h";
  }

  // Bateria
  if (now - lastBatteryDropTime >= 5000) {
    if (currentBattery > 0) currentBattery--;
    batteryElement.innerText = "Battery: " + currentBattery + "%";
    lastBatteryDropTime = now;
  }
}

// --- Sterowanie

function startDrone() {
  startTime = Date.now();
  speedStartTime = null;
  playMode = true;
  if (telemetryInterval) clearInterval(telemetryInterval);
  telemetryInterval = setInterval(updateTelemetry, interval);
}

function pauseDrone() {
  playMode = false;
  let deceleration = setInterval(() => {
    currentSpeed -= 0.4;
    if (currentSpeed <= 0) {
      currentSpeed = 0;
      clearInterval(deceleration);
    }
    speedElement.innerText = "Speed: " + formatSpeed(currentSpeed) + " km/h";
  }, 100);

  // Efekt wysokości po 6 sekundach
  setTimeout(() => {
    currentHeight = 8;
    heightElement.innerText = "Height: " + currentHeight.toFixed(2) + " m";

    let heightFall = setInterval(() => {
      currentHeight -= 0.1;
      if (currentHeight <= 7) {
        currentHeight = 7;
        clearInterval(heightFall);
      }
      heightElement.innerText = "Height: " + currentHeight.toFixed(2) + " m";
    }, 160);
  }, 6000);
}

function playDrone() {
  playMode = true;
  speedStartTime = Date.now();
}

function landDrone() {
  playMode = false;

  let landing = setInterval(() => {
    currentSpeed -= 0.3;
    if (currentSpeed <= 0) {
      currentSpeed = 0;
      clearInterval(landing);

      let descend = setInterval(() => {
        currentHeight -= 0.2;
        if (currentHeight <= 0) {
          currentHeight = 0;
          clearInterval(descend);
        }
        heightElement.innerText = "Height: " + currentHeight.toFixed(2) + " m";
      }, 150);
    }
    speedElement.innerText = "Speed: " + formatSpeed(currentSpeed) + " km/h";
  }, 130);
}

function sendNotification(msg) {
  if (Notification.permission === "granted") {
    new Notification(msg);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(msg);
      }
    });
  }
}

// --- Socket.io odbieranie akcji z kontrolera

socket.on("control-action", (action) => {
  console.log("Odebrana akcja:", action);

  switch(action) {
    case "start":
      startDrone();
      break;
    case "pause":
      pauseDrone();
      break;
    case "play":
      playDrone();
      break;
    case "land":
      landDrone();
      break;
    case "przesylka":
      sendNotification("Twoja paczka została dostarczona");
      break;
    case "ok":
      sendNotification("wszystko ok");
      break;
    default:
      console.warn("Nieznana akcja:", action);
  }
});
