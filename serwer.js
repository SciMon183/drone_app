const express = require("express");
const http = require("http");
const path = require("path");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = 3000;

// Serwowanie statycznych plików z katalogu głównego
app.use(express.static(path.join(__dirname)));

// Obsługa połączenia WebSocket
io.on("connection", (socket) => {
  console.log("Nowe połączenie:", socket.id);

  socket.on("control-action", (action) => {
    console.log("Odebrana akcja:", action);
    // Broadcast akcji do wszystkich klientów (np. do index.html)
    io.emit("control-action", action);
  });

  socket.on("disconnect", () => {
    console.log("Rozłączono:", socket.id);
  });
});

// Uruchomienie serwera
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
