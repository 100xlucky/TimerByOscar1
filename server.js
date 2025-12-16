const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let state = {
  timeLeft: 30,
  running: false
};

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) c.send(msg);
  });
}

setInterval(() => {
  if (state.running && state.timeLeft > 0) {
    state.timeLeft--;
    if (state.timeLeft === 0) state.running = false;
    broadcast(state);
  }
}, 1000);

wss.on("connection", ws => {
  ws.send(JSON.stringify(state));

  ws.on("message", msg => {
    const cmd = msg.toString();

    if (cmd === "START") state.running = true;
    if (cmd === "STOP") state.running = false;
    if (cmd === "RESET") {
      state.running = false;
      state.timeLeft = 30;
    }
    if (cmd === "ADD5" && state.timeLeft > 0) {
      state.timeLeft = Math.min(state.timeLeft + 5, 30);
    }

    broadcast(state);
  });
});

server.listen(process.env.PORT || 3000);
