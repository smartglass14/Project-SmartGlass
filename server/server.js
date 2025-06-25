import app from './app.js';
import { Server } from 'socket.io';
import http from 'http';
import "dotenv/config.js";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`📡 Socket connected: ${socket.id}`);

  socket.on('joinRoom', (roomCode) => {
    socket.join(roomCode);
    console.log(`🟢 User ${socket.id} joined room ${roomCode}`);
  });

  socket.on('sendMessage', ({ roomCode, message }) => {
    io.to(roomCode).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
