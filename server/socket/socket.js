import { Server } from "socket.io";
import socketAuth from "../middleware/socketAuth.js";
import { updateAnswer, submitVote, joinLiveQnA, updateTextAns } from "./socketController.js";

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
      joinLiveQnA(socket, sessionCode, role, liveQnASessions, io);
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
      
      socket.to(sessionCode).emit('quiz-started');
      socket.to(sessionCode).emit('sync-current-slide', liveQnASessions[sessionCode]);
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
      socket.to(sessionCode).emit('sync-current-slide', liveQnASessions[sessionCode]);
    });

    socket.on('finish-quiz', ({sessionCode})=> {
      if (liveQnASessions[sessionCode]) {
        delete liveQnASessions[sessionCode];
      }
      socket.to(sessionCode).emit("quiz-finished");
    })

    socket.on('timer-expired', ({ sessionCode }) => {
      socket.to(sessionCode).emit('timer-expired');
    });

    socket.on('submit-answer', ({ data }) => {
      updateAnswer(data, socket);
    });

    socket.on('submit-vote', (data)=> {
      submitVote(data, socket);
    })

    socket.on('submit-text-ans', ({ data })=> {
      updateTextAns(data, socket);
    })

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Remove from participants
      for (const sessionCode in liveQnASessions) {
        if (liveQnASessions[sessionCode].participants && socket.userId) {
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