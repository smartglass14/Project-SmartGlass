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