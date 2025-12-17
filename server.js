const { WebcastPushConnection } = require("tiktok-live-connector");
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const MAX_TIME = 30;
const tiktokUsername = "USERNAME_TIKTOK_KAMU";
const tiktok = new WebcastPushConnection(tiktokUsername);

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
  if (state.time <= 0) return;

  state.time--;

  if (state.time <= 0) {
    state.time = 0;
    state.running = false;
  }

  broadcast();
}, 1000);

wss.on("connection", ws => {
  ws.send(JSON.stringify(state));

  ws.on("message", msg => {
    const cmd = msg.toString();

    if (cmd.startsWith("GIFT:")) {
      const username = cmd.split(":")[1];

      state.leader = username;
      state.time = MAX_TIME;
      state.running = true;

      broadcast();
      return;
    }

    if (cmd === "STOP") {
      state.running = false;
    }

    if (cmd === "RESET") {
      state.running = false;
      state.time = MAX_TIME;
      state.leader = null;
    }

    if (cmd === "ADD5" && state.running) {
      state.time = Math.min(state.time + 5, MAX_TIME);
    }

    broadcast();
  });
});

tiktok.connect()
  .then(() => console.log("TikTok connected"))
  .catch(err => console.error("TikTok error", err));

tiktok.on("gift", data => {
  if (data.giftName !== "Finger Heart") return;

  state.leader = data.uniqueId;
  state.time = MAX_TIME;
  state.running = true;

  broadcast();
});

server.listen(process.env.PORT || 3000);
