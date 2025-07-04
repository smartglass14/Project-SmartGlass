import { Server } from "socket.io";
import socketAuth from "../middleware/socketAuth.js";

export default (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on('join-room', (roomId) => socket.join(roomId));

    socket.on('start-quiz', ({ roomId, question }) => {
      io.to(roomId).emit('quiz-question', question);
    });

    socket.on('submit-answer', ({ roomId, answer, student }) => {
      io.to(roomId).emit('receive-answer', { student, answer });
    });

    socket.on("send-message", ({ room, message }) => {
      io.to(room).emit("receive-message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
