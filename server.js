const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("."));

wss.on("connection", ws => {
  ws.on("message", msg => {
    // broadcast ke semua client
    wss.clients.forEach(c => {
      if (c.readyState === WebSocket.OPEN) {
        c.send(msg.toString());
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("WS server running on", PORT);
});
