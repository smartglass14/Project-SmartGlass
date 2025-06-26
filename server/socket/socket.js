import { Server } from "socket.io";

export default (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", ({ room }) => {
      socket.join(room);
      io.to(room).emit("notification", `🔔 A new user joined room: ${room}`);
    });

    socket.on("send-message", ({ room, message }) => {
      io.to(room).emit("receive-message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
