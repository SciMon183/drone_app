// === script.js ===
let speedElement = document.getElementById("speed");
let heightElement = document.getElementById("hight");
let batteryElement = document.getElementById("battery");
let gpsElement = document.getElementById("gps");

let currentSpeed = 0;
let currentHeight = 0;
let currentBattery = 88;
let currentGpsValue = 4;

let isStarted = false;
let isPaused = false;
let speedStartTime = null;
let heightStartTime = null;
let lastBatteryDropTime = Date.now();
let lastSpeedUpdateTime = 0;
let lastSatelliteValue = 0;

const rampDuration = 2900;
const heightDuration = 6000;
const gpsSatelliteDuration = 70000;
const speedUpdateInterval = 400;
const batteryInterval = 4000;

function formatSpeed(speed) {
  let rounded = speed.toFixed(2);
  let parts = rounded.split(".");
  return parseInt(parts[0]) + "," + parts[1].charAt(0);
}

function updateTelemetry() {
  let now = Date.now();

  // HEIGHT
  if (isStarted && !isPaused && heightStartTime) {
    let elapsed = now - heightStartTime;
    currentHeight = Math.min(7, (elapsed / heightDuration) * 7);
  }
  heightElement.innerText = "Height: " + currentHeight.toFixed(2) + " m";

  // GPS
  if (isStarted && !isPaused) {
    let gpsElapsed = now - heightStartTime;
    if (gpsElapsed < gpsSatelliteDuration) {
      let satellite = Math.floor(4 + (gpsElapsed / gpsSatelliteDuration) * 5);
      if (satellite !== lastSatelliteValue) {
        gpsElement.innerText = "Satelite number: " + satellite;
        lastSatelliteValue = satellite;
      }
    } else if (lastSatelliteValue !== 9) {
      gpsElement.innerText = "Satelite number: 9";
      lastSatelliteValue = 9;
    }
  }

  // SPEED
  if (isStarted && !isPaused && speedStartTime) {
    let speedElapsed = now - speedStartTime;
    if (speedElapsed < rampDuration) {
      currentSpeed = (speedElapsed / rampDuration) * 10;
    } else {
      if (now - lastSpeedUpdateTime >= speedUpdateInterval) {
        let randomOscillation = (Math.random() - 0.5) * 2;
        currentSpeed = 10 + randomOscillation;
        currentSpeed = Math.max(9, Math.min(11, currentSpeed));
        lastSpeedUpdateTime = now;
      }
    }
    speedElement.innerText = "Speed: " + formatSpeed(currentSpeed) + " km/h";
  }

  // BATTERY
  if (now - lastBatteryDropTime >= batteryInterval) {
    if (currentBattery > 0) {
      currentBattery--;
      batteryElement.innerText = "Battery: " + currentBattery + "%";
    }
    lastBatteryDropTime = now;
  }
}

setInterval(updateTelemetry, 200);

window.addEventListener("message", (event) => {
  console.log("Otrzymano wiadomość:", event.data);
  const { action } = event.data;

  switch (action) {
    case "start":
      // Logika dla start
      break;
    case "pause":
      // Logika dla pause
      break;
    case "play":
      // Logika dla play
      break;
    case "land":
      // Logika dla land
      break;
    default:
      console.warn("Nieznana akcja:", action);
  }
});
