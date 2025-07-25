import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../../services/socket";
import { LoaderCircle } from "lucide-react";
import { API, handleApi } from "../../services/api";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import toast from "react-hot-toast";
import StudentTextAns from '../../components/QuizComponent/studentTextAns';
import { useAuth } from "../../context/AuthContext";
import StudentQuizResult from '../../components/StudentQuizResult.jsx';

export default function LiveQnAStudent() {
  const { sessionCode } = useParams();
  const {isLoggedIn, user, guestUser} = useAuth();
  const socket = useSocket();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [timer, setTimer] = useState(null);
  const [waiting, setWaiting] = useState(true);
  const [swiper, setSwiper] = useState(null);
  const timerRef = useRef();
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [textAns, setTextAns] = useState("");
  const [showResult, setShowResult] = useState(false);
  
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

  useEffect(() => {
    if (!socket) return;

    const handleSync = (data) => {
      if (questionStartTime && activeSlide !== data.currentSlide && activeQuestion && activeQuestion.type === 'mcq') {
        const timeSpent = (Date.now() - questionStartTime) / 1000;
        const updatedTimeSpent = [...timeSpentPerQuestion];
        updatedTimeSpent[activeSlide] = Math.max(0, Math.min(30, timeSpent));
        setTimeSpentPerQuestion(updatedTimeSpent);
      }
      setActiveSlide(data.currentSlide || 0);
      setActiveQuestion(quiz?.questions[data.currentSlide || 0]);
      setTimer(data.timer || 30);
      setWaiting(false);
      setConfirmed(false);
      setSelectedOption(null);
      setTextAns("");
      setQuestionStartTime(Date.now()); 
      if (swiper) swiper.slideTo(data.currentSlide || 0);
      startTimer();
    };

    const handleQuizStarted = () => {
      setWaiting(false);
      setStartTime(new Date());
    };

    const handleQuizFinished = async () => {
      if (questionStartTime && activeQuestion && activeQuestion.type === 'mcq') {
        const timeSpent = (Date.now() - questionStartTime) / 1000;
        const updatedTimeSpent = [...timeSpentPerQuestion];
        updatedTimeSpent[activeSlide] = Math.max(0, Math.min(30, timeSpent));
        setTimeSpentPerQuestion(updatedTimeSpent);
      }

      setShowResult(true);
    };

    socket.on("sync-current-slide", handleSync);
    socket.on("quiz-started", handleQuizStarted);
    socket.on("quiz-finished", handleQuizFinished);

    return () => {
      socket.off("sync-current-slide", handleSync);
      socket.off("quiz-started", handleQuizStarted);
      socket.off("quiz-finished", handleQuizFinished);
    };
  }, [socket, swiper, activeQuestion, sessionCode, quiz, timer, userAnswers, timeSpentPerQuestion, startTime, questionStartTime, activeSlide]);

  const saveAnswer = (idx) => {
    if (confirmed) return;
    const q = quiz.questions[idx];
    const updated = [...userAnswers];
    updated[idx] = {
      questionId: q._id,
      selectedOption: selectedOption, 
      selectedOptionId: q.options[selectedOption]._id, 
      correctOption: q.correctOption,
      answerGiven: selectedOption !== null ? selectedOption : "Skipped",
    };
    setUserAnswers(updated);

    if (questionStartTime && q.type === 'mcq') {
      const timeSpent = (Date.now() - questionStartTime) / 1000;
      const updatedTimeSpent = [...timeSpentPerQuestion];
      updatedTimeSpent[idx] = Math.max(0, Math.min(30, timeSpent));
      setTimeSpentPerQuestion(updatedTimeSpent);
    }
    try {
      socket.emit('submit-answer', {
        data: {
          roomId: sessionCode,
          answer: {
            questionId: q._id,
            selectedOption: q.options[selectedOption]._id, 
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
    setConfirmed(true);
    toast.success("Answer submitted!");
  };

  const submitTextAnswer = (textAnswer, questionId, idx) => {
    if (confirmed) return;
    
    const updated = [...userAnswers];
    updated[idx] = {
      questionId: questionId,
      answerGiven: textAnswer,
    };
    setUserAnswers(updated);
    
    try {
      let data = { roomId: sessionCode, answer: { questionId: questionId, textAnswer }};
      if ((isLoggedIn && user?.name) || guestUser?.guestName) {
        data.answer.studentName = user?.name || guestUser.guestName;
      }
      socket.emit("submit-text-ans", { data });
    } catch (err) {
      console.log(err);
    }
    setConfirmed(true);
    setTextAns(""); 
    toast.success("Answer submitted!");
  };

  const handleConfirm = (questionId, questionType, idx) => {
    if (questionType === 'text') {
      if (textAns.length > 200) return toast.error("Answer length must be less than 200");
      submitTextAnswer(textAns, questionId, idx);
      return;
    }
    if (selectedOption == null || confirmed) return;
    saveAnswer(idx);
  };

  if (loading || !quiz) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin" size={40} />
      </div>
    );
  }

  if (showResult) {
    return (
      <StudentQuizResult
        userAnswers={userAnswers}
        questions={quiz?.questions}
        isLoggedIn={isLoggedIn ? isLoggedIn : guestUser ? true : false}
        code={sessionCode}
        startTime={startTime}
        endTime={new Date()}
        timeSpentPerQuestion={timeSpentPerQuestion}
      />
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
                    
                    {q.type === 'mcq' ? (
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
                    ) : (
                      <StudentTextAns
                        value={textAns}
                        onChange={setTextAns}
                        disabled={confirmed}
                      />
                    )}
                    
                    <button
                      onClick={() => handleConfirm(q._id, q.type, idx)}
                      className={`mt-6 w-full bg-green-500 text-white font-semibold py-2 rounded-xl hover:bg-green-600 transition ${
                        (q.type === 'mcq' ? selectedOption == null : textAns.length === 0) || confirmed
                          ? "opacity-60 cursor-not-allowed" 
                          : ""
                      }`}
                      disabled={(q.type === 'mcq' ? selectedOption == null : textAns.length === 0) || confirmed}
                    >
                      Confirm
                    </button>
                    
                    {confirmed && (
                      <div className="text-green-600 font-semibold mt-4 text-center">
                        ✓ Answer submitted! {activeSlide < quiz.questions.length - 1 ? 'Waiting for host to change slide...' : 'Waiting for host to finish...'}
                      </div>
                    )}
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