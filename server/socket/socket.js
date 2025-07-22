import { Server } from "socket.io";
import socketAuth from "../middleware/socketAuth.js";
import { updateAnswer, submitVote } from "./socketController.js";

export default (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.use(socketAuth);

  const liveQnASessions = {}; // { sessionCode: { currentSlide, timer, answers: { userId: answerIndex } } }

  io.on('connection', (socket) => {
    console.log("User connected:", socket.id);

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      socket.emit("success", {msg: "Session Joined", status: "success"});
    });

    socket.on('join-qna-room', ({ sessionCode, role }) => {
      // Check if user is already in this session
      const rooms = Array.from(socket.rooms);
      if (rooms.includes(sessionCode)) {
        socket.emit("success", {msg: "Session Already Joined", status: "success"});
        return;
      }

      socket.join(sessionCode);
      
      if (!liveQnASessions[sessionCode]) {
        liveQnASessions[sessionCode] = { 
          participants: new Set(), 
          started: false,
          currentSlide: 0,
          timer: 30,
          answers: {},
          timerStart: null
        };
      }
      
      if (role === 'student' && socket.userId) {
        liveQnASessions[sessionCode].participants.add(socket.userId);
      }
      
      const count = liveQnASessions[sessionCode].participants.size;
      
      io.to(sessionCode).emit('participant-count', { count });
      
      if (liveQnASessions[sessionCode].started) {
        socket.emit('sync-current-slide', liveQnASessions[sessionCode]);
        socket.emit('quiz-started');
      }
      
      socket.emit("success", {msg: "Session Joined", status: "success"});
    });

    socket.on('start-quiz', ({ sessionCode }) => {

      if (!liveQnASessions[sessionCode]) {
        liveQnASessions[sessionCode] = { 
          participants: new Set(), 
          started: false,
          currentSlide: 0,
          timer: 30,
        };
      }
      liveQnASessions[sessionCode].started = true;
      liveQnASessions[sessionCode].currentSlide = 0;
      liveQnASessions[sessionCode].timerStart = Date.now();
      
      io.to(sessionCode).emit('quiz-started');
      io.to(sessionCode).emit('sync-current-slide', liveQnASessions[sessionCode]);
    });

    socket.on('educator-change-slide', ({ sessionCode, slideIndex, timer }) => {

      if (!liveQnASessions[sessionCode]) {
        liveQnASessions[sessionCode] = { 
          participants: new Set(), 
          started: false,
          currentSlide: 0,
          timer: 30,
        };
      }
      liveQnASessions[sessionCode].currentSlide = slideIndex;
      liveQnASessions[sessionCode].timer = timer;
      liveQnASessions[sessionCode].timerStart = Date.now();
      io.to(sessionCode).emit('sync-current-slide', liveQnASessions[sessionCode]);
    });

    socket.on('finish-quiz', ({sessionCode})=> {
      io.to(sessionCode).emit("quiz-finished");
    })

    socket.on('timer-expired', ({ sessionCode }) => {
      io.to(sessionCode).emit('timer-expired');
    });

    socket.on('submit-answer', async({ data }) => {
        updateAnswer(data, socket);
    });

    socket.on('submit-vote', async(data)=> {
       submitVote(data, socket);
    })

    socket.on("send-message", ({ room, message }) => {
      io.to(room).emit("receive-message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Remove from participants
      for (const sessionCode in liveQnASessions) {
        if (liveQnASessions[sessionCode].participants && socket.user && socket.userId) {
          const wasRemoved = liveQnASessions[sessionCode].participants.delete(socket.userId);
          if (wasRemoved) {
            const count = liveQnASessions[sessionCode].participants.size;
            io.to(sessionCode).emit('participant-count', { count });
          }
        }
      }
    });
  });
};