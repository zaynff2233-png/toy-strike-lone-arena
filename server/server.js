// Toy Strike: Lone Arena — Online Multiplayer Relay Server
// This is a lightweight room-code based relay server using Socket.IO.
// It does NOT run game physics itself — each player's own browser runs the
// game and this server just forwards position/shoot/hit messages between
// everyone in the same room. That keeps it simple and cheap to host.

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' } // allow the game (hosted on GitHub Pages) to connect
});

app.get('/', (req, res) => {
    res.send('Toy Strike: Lone Arena multiplayer server is running.');
});

// rooms[code] = { players: { socketId: {name, char} } }
const rooms = {};

function makeRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code;
    do {
        code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    } while (rooms[code]);
    return code;
}

io.on('connection', (socket) => {
    socket.data.room = null;

    socket.on('createRoom', ({ name, char }) => {
        const code = makeRoomCode();
        rooms[code] = { players: {} };
        rooms[code].players[socket.id] = { name, char };
        socket.join(code);
        socket.data.room = code;
        socket.emit('roomCreated', { code });
    });

    socket.on('joinRoom', ({ code, name, char }) => {
        code = (code || '').toUpperCase();
        const room = rooms[code];
        if (!room) { socket.emit('roomError', 'Room nahi mila - code check karo.'); return; }
        room.players[socket.id] = { name, char };
        socket.join(code);
        socket.data.room = code;
        socket.emit('roomJoined', { code });
        // Tell everyone already in the room that a new player joined
        socket.to(code).emit('playerJoined', { id: socket.id, name, char });
        // Tell the new player about everyone already there
        Object.entries(room.players).forEach(([id, p]) => {
            if (id !== socket.id) socket.emit('playerJoined', { id, name: p.name, char: p.char });
        });
    });

    socket.on('playerReady', ({ code }) => {
        // Simple readiness ping - could be extended to a countdown sync
        socket.to(code).emit('playerJoined', { id: socket.id, ...(rooms[code]?.players[socket.id] || {}) });
    });

    socket.on('state', (data) => {
        if (!socket.data.room) return;
        socket.to(socket.data.room).emit('playerState', { id: socket.id, ...data });
    });

    socket.on('shoot', (data) => {
        if (!socket.data.room) return;
        socket.to(socket.data.room).emit('playerShoot', { id: socket.id, ...data });
    });

    socket.on('hit', ({ code, targetId, damage, isHeadshot }) => {
        if (!code) return;
        io.to(code).emit('playerHit', { targetId, damage, isHeadshot, from: socket.id });
    });

    socket.on('disconnect', () => {
        const code = socket.data.room;
        if (code && rooms[code]) {
            delete rooms[code].players[socket.id];
            socket.to(code).emit('playerLeft', socket.id);
            if (Object.keys(rooms[code].players).length === 0) delete rooms[code];
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Multiplayer server running on port ${PORT}`));
