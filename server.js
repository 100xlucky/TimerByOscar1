const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    let tiktokConnection;

    socket.on('setUniqueId', (uniqueId) => {
        if (tiktokConnection) {
            tiktokConnection.disconnect();
        }

        tiktokConnection = new WebcastPushConnection(uniqueId);

        tiktokConnection.connect().then(state => {
            socket.emit('streamData', {
                viewerCount: state.viewerCount
            });
        }).catch(err => {
            socket.emit('error', 'Yayına bağlanılamadı');
        });

        tiktokConnection.on('roomUser', msg => {
            socket.emit('updateViewers', msg.viewerCount);
        });

        tiktokConnection.on('envelope', data => {
            socket.emit('chestEvent', data);
        });
    });

    socket.on('disconnect', () => {
        if (tiktokConnection) tiktokConnection.disconnect();
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Sunucu ${PORT} portunda aktif.`));
