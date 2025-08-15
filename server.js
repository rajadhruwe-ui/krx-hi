const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: '*' },
  maxHttpBufferSize: 1e7 // ~10 MB to allow short audio chunks
});

io.on('connection', (socket) => {
  let room = null;

  socket.on('join', (roomId) => {
    if (room) socket.leave(room);
    room = roomId;
    socket.join(roomId);
    socket.emit('joined', roomId);
  });

  // Relay audio chunks (ArrayBuffer / base64) to everyone else in the room
  socket.on('ptt-chunk', ({ roomId, chunk, mimeType, seq }) => {
    socket.to(roomId).emit('ptt-chunk', { chunk, mimeType, seq });
  });

  socket.on('ptt-start', ({ roomId }) => {
    socket.to(roomId).emit('ptt-start');
  });

  socket.on('ptt-stop', ({ roomId }) => {
    socket.to(roomId).emit('ptt-stop');
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`PTT server running on :${PORT}`));
