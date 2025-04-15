// Nawiązanie połączenia z Socket.IO
const socket = io();

// START — uruchamia drona
function startDrone() {
  socket.emit("control-action", "start");
}

// LĄDOWANIE — rozpoczyna proces lądowania
function landDrone() {
  socket.emit("control-action", "land");
}

// PAUZA — zatrzymuje prędkość drona do 0, wysokość zostaje
function pauseDrone() {
  socket.emit("control-action", "pause");
}

// PLAY — wznowienie ruchu prędkości (od 0 do 10)
function playDrone() {
  socket.emit("control-action", "play");
}

// POWIADOMIENIE — wysyła powiadomienie + akcję (jeśli dotyczy)
function sendNotification(message) {
  // Obsługa lokalnych powiadomień PUSH
  if (Notification.permission === "granted") {
    new Notification(message);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(message);
      }
    });
  }

  // Opcjonalne emitowanie dodatkowych akcji
  if (message === "Twoja paczka została dostarczona") {
    socket.emit("control-action", "delivered");
  } else if (message === "wszystko ok") {
    socket.emit("control-action", "ok");
  }
}
