const express = require('express');
const http = require('https');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const server = https.createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: '*' },
  maxHttpBufferSize: 1e7 // ~10 MB to allow short audio chunks
});

io.on('connection', (socket) => {
  let room = null;

  // Join a room
  socket.on('join', (roomId) => {
    if (room) socket.leave(room);
    room = roomId;
    socket.join(roomId);
    socket.emit('joined', roomId);
  });

  // Relay audio chunks
  socket.on('ptt-chunk', ({ roomId, chunk, mimeType, seq }) => {
    socket.to(roomId).emit('ptt-chunk', { chunk, mimeType, seq });
  });

  socket.on('ptt-start', ({ roomId }) => {
    socket.to(roomId).emit('ptt-start');
  });

  socket.on('ptt-stop', ({ roomId }) => {
    socket.to(roomId).emit('ptt-stop');
  });

  // ======================
  // Chat Message Handling
  // ======================
  socket.on('chat-message', ({ roomId, sender, message }) => {
    const timestamp = new Date().toISOString();
    // Send message to everyone else in the room
    socket.to(roomId).emit('chat-message', { sender, message, timestamp });
    // Optionally: echo back to the sender
    socket.emit('chat-message', { sender, message, timestamp });
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`PTT server running on :${PORT}`));
