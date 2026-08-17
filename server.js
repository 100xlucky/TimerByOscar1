const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    let tiktokConnection = null;

    socket.on('setUniqueId', (uniqueId) => {
        if (tiktokConnection) {
            try { tiktokConnection.disconnect(); } catch(e) {}
        }

        // TikTok bağlantısını başlat
        tiktokConnection = new WebcastPushConnection(uniqueId, {
            processInitialData: false,
            enableExtendedGiftInfo: true
        });

        tiktokConnection.connect().then(state => {
            socket.emit('streamData', { viewerCount: state.viewerCount });
        }).catch(err => {
            console.log('Bağlantı hatası:', err.message);
            socket.emit('error', 'Yayına bağlanılamadı veya yayın kapalı!');
        });

        tiktokConnection.on('roomUser', msg => {
            socket.emit('updateViewers', msg.viewerCount);
        });

        tiktokConnection.on('envelope', data => {
            socket.emit('chestEvent', data);
        });

        tiktokConnection.on('streamEnd', () => {
            socket.emit('error', 'Yayın sona erdi.');
        });
    });

    socket.on('disconnect', () => {
        if (tiktokConnection) {
            try { tiktokConnection.disconnect(); } catch(e) {}
        }
    });
});

// Sunucunun çökmesini engelleyen güvenlik önlemi
process.on('uncaughtException', (err) => {
    console.error('Yakalanmayan hata:', err);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Sunucu ${PORT} portunda aktif.`));
