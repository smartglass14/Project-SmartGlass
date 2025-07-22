import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../../services/socket";
import { LoaderCircle } from "lucide-react";
import { API, handleApi } from "../../services/api";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import toast from "react-hot-toast";
import { submitQuizResult } from "../../services/leaderboardAPI";

export default function LiveQnAStudent() {
  const { sessionCode } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [timer, setTimer] = useState(30);
  const [waiting, setWaiting] = useState(true);
  const [swiper, setSwiper] = useState(null);
  const timerRef = useRef();
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  

  // Fetch quiz data on mount
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      const res = await handleApi(API.get(`/quiz/${sessionCode}`));
      if (res.error) {
        toast.error(res.error.message);
        setLoading(false);
        return;
      }
      setQuiz(res.data.quiz);
      setLoading(false);
    };
    fetchQuiz();
  }, [sessionCode]);

  // Join socket room on mount
  useEffect(() => {
    if (socket && sessionCode) {
      socket.emit("join-qna-room", { sessionCode, role: "student" });
    }
  }, [socket, sessionCode]);

   const startTimer = () => {
    let t = 30;
    setTimer(t);
    timerRef.current = setInterval(() => {
      t -= 1;
      setTimer(t);
      if (t <= 0) {
        clearInterval(timerRef.current);
      }
    }, 1000);
  };


  // Listen for host events and timer sync
  useEffect(() => {
    if (!socket) return;

    const handleSync = (data) => {
      // Save time spent on previous question if we're moving to a new question
      if (questionStartTime && activeSlide !== data.currentSlide) {
        const timeSpent = (Date.now() - questionStartTime) / 1000;
        const updatedTimeSpent = [...timeSpentPerQuestion];
        updatedTimeSpent[activeSlide] = Math.max(0, Math.min(30, timeSpent)); // Cap at 30 seconds
        setTimeSpentPerQuestion(updatedTimeSpent);
      }
      setActiveSlide(data.currentSlide || 0);
      setActiveQuestion(quiz?.questions[data.currentSlide || 0]);
      setTimer(data.timer || 30);
      setWaiting(false);
      setConfirmed(false);
      setSelectedOption(null);
      setQuestionStartTime(Date.now()); // Start timing for new question
      if (swiper) swiper.slideTo(data.currentSlide || 0);
      startTimer();
    };

    const handleQuizStarted = () => {
      setWaiting(false);
      setStartTime(new Date());
    };

    const handleQuizFinished = async () => {
      // Save time spent for the last question
      if (questionStartTime) {
        const timeSpent = (Date.now() - questionStartTime) / 1000;
        const updatedTimeSpent = [...timeSpentPerQuestion];
        updatedTimeSpent[activeSlide] = Math.max(0, Math.min(30, timeSpent));
        setTimeSpentPerQuestion(updatedTimeSpent);
      }
      // Prepare analytics payload
      const endTime = new Date();
      const payload = {
        sessionCode,
        answers: userAnswers.map(ans => ({
          questionId: ans.questionId,
          selectedOption: ans.selectedOption, // index
          correctOption: ans.correctOption,   // index
          answerGiven: ans.answerGiven,       // index or "Skipped"
        })),
        startTime,
        endTime,
        timeSpentPerQuestion,
      };
      try {
        await submitQuizResult(payload);
        localStorage.setItem('isServiceUsed', true)
        navigate(`/leaderboard/${sessionCode}`);
      } catch (err) {
        console.log(err);
      }
    };

    socket.on("sync-current-slide", handleSync);
    socket.on("quiz-started", handleQuizStarted);
    socket.on("quiz-finished", handleQuizFinished);

    return () => {
      socket.off("sync-current-slide", handleSync);
      socket.off("quiz-started", handleQuizStarted);
      socket.off("quiz-finished", handleQuizFinished);
    };
  }, [socket, swiper, navigate, sessionCode, quiz, timer, userAnswers, timeSpentPerQuestion, startTime, questionStartTime, activeSlide]);

  // Save answer and emit to socket
  const saveAnswer = () => {
    if (!activeQuestion || confirmed) return;
    const updated = [...userAnswers];
    updated[activeSlide] = {
      questionId: activeQuestion._id,
      selectedOption: selectedOption, // index (for analytics)
      selectedOptionId: activeQuestion.options[selectedOption]._id, // ObjectId (for quiz vote)
      correctOption: activeQuestion.correctOption, // index
      answerGiven: selectedOption !== null ? selectedOption : "Skipped",
    };
    setUserAnswers(updated);
    // Track time spent for this question
    if (questionStartTime) {
      const timeSpent = (Date.now() - questionStartTime) / 1000;
      const updatedTimeSpent = [...timeSpentPerQuestion];
      updatedTimeSpent[activeSlide] = Math.max(0, Math.min(30, timeSpent));
      setTimeSpentPerQuestion(updatedTimeSpent);
    }
    try {
      socket.emit('submit-answer', {
        data: {
          roomId: sessionCode,
          answer: {
            questionId: activeQuestion._id,
            selectedOption: activeQuestion.options[selectedOption]._id, // ObjectId
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
    setConfirmed(true);
    toast.success("Answer submitted!");
  };

  const handleConfirm = () => {
    if (selectedOption == null || confirmed) return;
    saveAnswer();
  };

  if (loading || !quiz) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <>
      {waiting ? (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 to-blue-100">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">Live QnA</h2>
            <p className="text-gray-600 mb-4">#{sessionCode}</p>
            <div className="text-blue-600 font-semibold mt-6 text-center">
              Waiting for host to start quiz...
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 to-blue-100">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
              <h2 className="text-2xl font-bold text-purple-700 mb-2 sm:mb-0">
                {quiz.title || "Live QnA"}
              </h2>
              <div className="text-lg font-semibold text-purple-700">
                Question {activeSlide + 1} of {quiz.questions.length}
              </div>
            </div>
            
            <Swiper
              slidesPerView={1}
              onSwiper={setSwiper}
              allowTouchMove={false}
              initialSlide={activeSlide}
            >
              {quiz.questions.map((q, idx) => (
                <SwiperSlide key={q._id || idx}>
                  <div className="p-4">
                    <div className="flex justify-between mb-2 text-sm text-gray-600">
                      <p>Question {idx + 1} of {quiz.questions.length}</p>
                      <p className="text-red-500 font-semibold">⏱️ {timer}s</p>
                    </div>
                    
                    <h3 className="font-medium text-lg mb-4">{q.question}</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt, oidx) => (
                        <div
                          key={oidx}
                          className={`cursor-pointer px-4 py-3 rounded-xl border transition-all
                            ${selectedOption === oidx ? "bg-purple-100 border-purple-500" : "bg-white border-gray-300 hover:border-purple-400"}
                            ${confirmed ? "opacity-60 pointer-events-none" : ""}
                          `}
                          onClick={() => {
                            if (!confirmed) setSelectedOption(oidx);
                          }}
                        >
                          {opt.text}
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={handleConfirm}
                      className={`mt-6 w-full bg-green-500 text-white font-semibold py-2 rounded-xl hover:bg-green-600 transition ${
                        selectedOption == null || confirmed
                          ? "opacity-60 cursor-not-allowed" 
                          : ""
                      }`}
                      disabled={selectedOption == null || confirmed}
                    >
                      {confirmed ? "Answer Submitted" : "Confirm Answer"}
                    </button>
                    
                    {confirmed && !(activeSlide < quiz.questions.length - 1) ?
                     (<div className="text-green-600 font-semibold mt-4 text-center">
                        ✓ Answer submitted! Waiting for next question...
                      </div>):
                      (<div className="text-green-600 font-semibold mt-4 text-center">
                        ✓ Answer submitted! Waiting for host to finish...
                      </div>)
                  }
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </>
  );
}