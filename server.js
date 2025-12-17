const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const MAX_TIME = 30;

let state = {
  time: MAX_TIME,
  running: false,
  leader: null
};


function broadcast() {
  const data = JSON.stringify(state);
  wss.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) c.send(data);
  });
}

setInterval(() => {
  if (!state.running) return;
  if (state.time > 0) {
    state.time--;
    if (state.time === 0) state.running = false;
    broadcast();
  }
}, 1000);

wss.on("connection", ws => {
  ws.send(JSON.stringify(state));

  ws.on("message", msg => {if (cmd.startsWith("GIFT:")) {
  const username = cmd.split(":")[1];
  state.leader = username;
  state.running = true;
  state.time = MAX_TIME;
  broadcast();
  return;
}

    const cmd = msg.toString();

    if (cmd === "STOP") state.running = false;
    if (cmd === "RESET") {
      state.running = false;
      state.time = MAX_TIME;
    }
    if (cmd === "ADD5" && state.time > 0) {
      state.time = Math.min(state.time + 5, MAX_TIME);
    }

    broadcast();
  });
});

server.listen(process.env.PORT || 3000);
