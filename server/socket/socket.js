import { Server } from "socket.io";
import socketAuth from "../middleware/socketAuth.js";
import { updateAnswer } from "./socketController.js";

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

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      socket.emit("success", {msg: "Session Joined", status: "success"});
    }
  );

    socket.on('submit-answer', async({ data }) => {
        updateAnswer(data, socket);
    });

    socket.on("send-message", ({ room, message }) => {
      io.to(room).emit("receive-message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
