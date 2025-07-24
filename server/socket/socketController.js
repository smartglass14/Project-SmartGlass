import Session from "../models/Session.js"
import Quiz from "../models/Quiz.js"
import Poll from "../models/Poll.js";

export const updateAnswer = async (data, socket) => {
  const { roomId: code, answer } = data;

  try {
    if (!code || !answer || !answer.questionId || !answer.selectedOption) {
      return socket.emit("error", {
        type: "data-error",
        msg: "Incomplete data. Session code and answer details required.",
      });
    }

    if(answer?.selectedOption == "Skipped"){
        return;
    }

    const session = await Session.findOne({ sessionCode: code });
    if (!session) {
      return socket.emit("error", {
        type: "code-error",
        msg: "Invalid Session Code",
      });
    }

    const quiz = await Quiz.findOneAndUpdate(
      {
        session: session._id,
        "questions._id": answer.questionId,
      },
      {
        $inc: {
          "questions.$[q].options.$[o].votes": 1,
        },
      },
      {
        arrayFilters: [
          { "q._id": answer.questionId },
          { "o._id": answer.selectedOption },
        ],
        new: true,
      }
    );

    if (!quiz) {
      return socket.emit("error", {
        type: "update-error",
        msg: "Failed to update vote. Question or option not found.",
      });
    }

    socket.to(code).emit("update-answer", {questionId: answer.questionId, selectedOption: answer.selectedOption})

  } catch (err) {
    console.error("Socket update error:", err.message);
    socket.emit("error", {
      type: "server-error",
      msg: "Something went wrong while updating answer.",
    });
  }
};


export const submitVote = async(data, socket)=> {
  try {
    const {roomId:code, payload} = data;

    if (!code || !payload || !payload.pollId || !payload.selectedOption) {
      return socket.emit("error", {
        type: "data-error",
        msg: "Incomplete data, selecting an option required",
      });
    }

    const poll = await Poll.findOneAndUpdate(
      {
        _id: payload.pollId,
        "options._id": payload.selectedOption,
      },
      {
        $inc: { "options.$.votes": 1 },
      },
      { new: true }
    )

    if (!poll) {
      return socket.emit("error", {
        type: "update-error",
        msg: "Failed to update vote. Question or option not found.",
      });
    }

    const updatedOption = poll.options.find(
      (opt) => opt._id.toString() === payload.selectedOption
    );
    if (updatedOption) {
      socket.to(code).emit("poll-update", updatedOption); 
    }
    
  } catch (err) {
    console.log("Vote-submit-error:", err.message);
  }
}

export const joinLiveQnA = (socket, sessionCode, role, liveQnASessions, io) => {
  // Check if user is already in this session
  const rooms = Array.from(socket.rooms);
  if (rooms.includes(sessionCode)) {
    socket.emit("success", {msg: "Session Already Joined", status: "success"});
    return { alreadyJoined: true };
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
  return { alreadyJoined: false, count, started: liveQnASessions[sessionCode].started };
};

export const updateTextAns = async(data, socket)=> {
  const { roomId: code, answer } = data;
  const studentName = socket.userName;

  try {
    if (!code || !answer || !answer.questionId || answer?.studentName !== studentName) {
      return socket.emit("error", {
        type: "data-error",
        msg: "Incomplete data or student name don't match.",
      });
    }

    const session = await Session.findOne({ sessionCode: code });
    if (!session) {
      return socket.emit("error", {
        type: "code-error",
        msg: "Invalid Session Code",
      });
    }

    const quiz = await Quiz.findOneAndUpdate(
      {
        session: session._id,
        "questions._id": answer.questionId,
        "questions.type": 'text'
      },
      {
        $push: {
          "questions.$[q].answersGivenBy": {
            studentName: studentName,
            answer: answer.textAnswer || "Skipped"
          }
        }
      },
      {
        arrayFilters: [{ "q._id": answer.questionId }],
        new: true
      }
    );
    
    if (!quiz) {
      return socket.emit("error", {
        type: "update-error",
        msg: "Failed to update text answer. Question not found or not a text question.",
      });
    }

    socket.to(code).emit("update-text-ans", {
      questionId: answer.questionId,
      studentName: answer.studentName,
      answer: answer.textAnswer || "Skipped"
    });

  } catch (err) {
    console.error("Socket updateTextAns error:", err.message);
    socket.emit("error", {
      type: "server-error",
      msg: "Something went wrong while updating text answer.",
    });
  }
}