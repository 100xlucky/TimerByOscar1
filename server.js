const WebSocket = require("ws");
const http = require("http");

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let time = 30;
let interval = null;

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) c.send(msg);
  });
}

function startTimer() {
  if (interval) return;
  interval = setInterval(() => {
    if (time > 0) {
      time--;
      broadcast({ time });
    } else {
      stopTimer();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(interval);
  interval = null;
}

wss.on("connection", ws => {
  // kirim waktu awal
  ws.send(JSON.stringify({ time }));

  ws.on("message", msg => {
    const cmd = msg.toString();

    if (cmd === "START") startTimer();
    if (cmd === "STOP") stopTimer();

    if (cmd === "ADD_5") {
      if (time === 0) return;
      time = Math.min(time + 5, 30);

      // 🔴 INI KUNCI NYA
      broadcast({
        time,
        added: 5   // ⬅️ SINYAL BUAT +5 KUNING
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
