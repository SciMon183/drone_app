let speedElement = document.getElementById("speed");
let heightElement = document.getElementById("height"); // FIXED!
let batteryElement = document.getElementById("battery");
let gpsElement = document.getElementById("gps");

let currentSpeed = 0;
let currentHeight = 0;
let currentBattery = 88;
let lastSatelliteValue = 0;

let isLanding = false;
let isPaused = false;
let isRampingFromPlay = false;

let pauseInterval = null;
let heightJerkTimeout = null;

let speedStartTime = null;
let lastBatteryDropTime = Date.now();
let lastSpeedUpdateTime = 0;

const interval = 320;
const rampDuration = 2900;
const heightDuration = 6000;
const gpsSatelliteDuration = 15000;
const speedUpdateInterval = 900;

let startTime = Date.now();

function formatSpeed(speed) {
  return speed.toFixed(1).replace(".", ",");
}

function updateTelemetry() {
  if (isLanding || isPaused || isRampingFromPlay) return;

  const now = Date.now();
  const elapsed = now - startTime;

  if (elapsed < heightDuration) {
    currentHeight = (elapsed / heightDuration) * 7;
  } else {
    currentHeight = 7;
  }
  heightElement.innerText = "Height: " + currentHeight.toFixed(2) + " m";

  if (elapsed < gpsSatelliteDuration) {
    let progress = elapsed / gpsSatelliteDuration;
    let satellite = Math.floor(4 + progress * 5);
    if (satellite !== lastSatelliteValue) {
      gpsElement.innerText = "Satelite number: " + satellite;
      lastSatelliteValue = satellite;
    }
  } else if (lastSatelliteValue !== 9) {
    gpsElement.innerText = "Satelite number: 9";
    lastSatelliteValue = 9;
  }

  if (currentHeight >= 6.5 && speedStartTime === null) {
    speedStartTime = now;
  }

  if (speedStartTime !== null) {
    const speedElapsed = now - speedStartTime;
    if (speedElapsed < rampDuration) {
      currentSpeed = ((speedElapsed / rampDuration) * 10) + (Math.random() - 0.5) * 0.4;
    } else if (now - lastSpeedUpdateTime >= speedUpdateInterval) {
      let osc = (Math.random() - 0.5) * 0.45;
      currentSpeed = 10 + osc;
      currentSpeed = Math.max(9.8, Math.min(11, currentSpeed));
      lastSpeedUpdateTime = now;
    }
    speedElement.innerText = "Speed: " + formatSpeed(currentSpeed) + " km/h";
  }

  if (now - lastBatteryDropTime >= 5000) {
    if (currentBattery > 0) currentBattery--;
    batteryElement.innerText = "Battery: " + currentBattery + "%";
    lastBatteryDropTime = now;
  }
}

function startLanding() {
  isLanding = true;
  clearInterval(pauseInterval);
  clearTimeout(heightJerkTimeout);
  isRampingFromPlay = false;

  const landingInterval = setInterval(() => {
    if (currentSpeed > 0) {
      currentSpeed -= 0.3;
      currentSpeed = Math.max(0, currentSpeed);
      speedElement.innerText = "Speed: " + formatSpeed(currentSpeed) + " km/h";
    } else if (currentHeight > 0) {
      currentHeight -= 0.25;
      currentHeight = Math.max(0, currentHeight);
      heightElement.innerText = "Height: " + currentHeight.toFixed(2) + " m";
    } else {
      clearInterval(landingInterval);
    }
  }, 300);
}

function startPause() {
  isPaused = true;
  clearInterval(pauseInterval);
  clearTimeout(heightJerkTimeout);
  isRampingFromPlay = false;

  pauseInterval = setInterval(() => {
    if (currentSpeed > 0) {
      currentSpeed -= 0.5;
      currentSpeed = Math.max(0, currentSpeed);
      speedElement.innerText = "Speed: " + formatSpeed(currentSpeed) + " km/h";
    } else {
      clearInterval(pauseInterval);
    }
  }, 200);

  heightJerkTimeout = setTimeout(() => {
    let jerkSteps = 15;
    let i = 0;
    let upInterval = setInterval(() => {
      if (i < jerkSteps) {
        currentHeight += (8 - currentHeight) / (jerkSteps - i);
        heightElement.innerText = "Height: " + currentHeight.toFixed(2) + " m";
        i++;
      } else {
        clearInterval(upInterval);
        let j = 0;
        let downInterval = setInterval(() => {
          if (j < jerkSteps) {
            currentHeight -= (currentHeight - 7) / (jerkSteps - j);
            heightElement.innerText = "Height: " + currentHeight.toFixed(2) + " m";
            j++;
          } else {
            clearInterval(downInterval);
            currentHeight = 7;
            heightElement.innerText = "Height: " + currentHeight.toFixed(2) + " m";
          }
        }, 100);
      }
    }, 100);
  }, 6000);
}

function resumePlay() {
  isPaused = false;
  clearInterval(pauseInterval);
  clearTimeout(heightJerkTimeout);

  isRampingFromPlay = true;
  let t = 0;
  let rampInterval = setInterval(() => {
    if (t <= 10) {
      let noise = (Math.random() - 0.5) * 0.3;
      currentSpeed = t + noise;
      speedElement.innerText = "Speed: " + formatSpeed(currentSpeed) + " km/h";
      t += 0.5;
    } else {
      clearInterval(rampInterval);
      isRampingFromPlay = false;
      lastSpeedUpdateTime = Date.now();
    }
  }, 180);
}

setInterval(updateTelemetry, interval);

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return;
  const action = event.data.action;
  if (action === "land") {
    startLanding();
  } else if (action === "pause") {
    startPause();
  } else if (action === "play") {
    resumePlay();
  }
});
