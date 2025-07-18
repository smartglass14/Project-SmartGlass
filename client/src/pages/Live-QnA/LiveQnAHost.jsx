import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API, handleApi } from "../../services/api";
import { LoaderCircle } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useSocket } from "../../services/socket";

export default function LiveQnAHost() {
  const socket = useSocket()
  const navigate = useNavigate();

  const { sessionCode } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timer, setTimer] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const timerRef = useRef();

  // Fetch quiz data
  useEffect(() => {
    handleApi(API.get(`/quiz/${sessionCode}`)).then(res => {
      if (res.data?.quiz) setQuiz(res.data.quiz);
    });
  }, [sessionCode]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !sessionCode) return;
    socket.emit("join-qna-room", { sessionCode, role: "educator" });

    socket.on("participant-count", ({ count }) => setParticipantCount(count));
    socket.on("quiz-started", () => setQuizStarted(true));
    socket.on("update-answer", handleQuizUpdate);
    return () => {
      socket.off("participant-count");
      socket.off("quiz-started");
      socket.off("update-answer", handleQuizUpdate);
    };
  }, [sessionCode, socket]);

  // Handle real-time answer updates (like QuizResult)
  const handleQuizUpdate = (data) => {
    const { selectedOption, questionId } = data;
    setQuiz((prevQuiz) => {
      if (!prevQuiz) return prevQuiz;
      const updatedQuestions = prevQuiz.questions.map((q) => {
        if (q._id !== questionId) return q;
        const updatedOptions = q.options.map((opt) =>
          opt._id === selectedOption
            ? { ...opt, votes: (opt.votes || 0) + 1 }
            : opt
        );
        return { ...q, options: updatedOptions };
      });
      return { ...prevQuiz, questions: updatedQuestions };
    });
  };

  const startTimer = () => {
    setTimerActive(true);
    let t = 30;
    setTimer(t);
    timerRef.current = setInterval(() => {
      t -= 1;
      setTimer(t);
      if (t <= 0) {
        clearInterval(timerRef.current);
        setTimerActive(false);
        socket.emit("timer-expired", { sessionCode });
      }
    }, 1000);
  };

  const startQuiz = () => {
    socket.emit("start-quiz", { sessionCode });
    setQuizStarted(true);
    setCurrentSlide(0);
    startTimer();
  };

  const nextSlide = () => {
    if (timerActive) return;
    const next = currentSlide + 1;
    if (quiz && next < quiz.questions.length) {
      setCurrentSlide(next);
      socket.emit("educator-change-slide", { sessionCode, slideIndex: next, timer: 30 });
      startTimer();
    }
  };

  const finishQuiz = ()=>{
    socket.emit('finish-quiz', ({sessionCode}))
    navigate(`/results/quiz/${sessionCode}`)
  }
  
  if (!quiz) return <div className="flex justify-center items-center h-screen"><LoaderCircle className="animate-spin" size={40} /></div>;
  
  if (!quizStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-purple-700">{quiz.title}</h2>
          <div className="mb-4 text-lg">Waiting for participants to join...</div>
          <div className="mb-4 text-xl font-semibold">Participants: {participantCount}</div>
          <button
            className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-bold disabled:bg-gray-400"
            onClick={startQuiz}
            disabled={participantCount === 0}
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }


  const q = quiz.questions[currentSlide];
  const chartData = q.options.map((opt, idx) => ({
    option: opt.text,
    count: opt.votes || 0,
    fill: idx === q.correctOption ? "#22c55e" : "#8B5CF6",
  }));
  const totalVotes = chartData.reduce((sum, opt) => sum + opt.count, 0);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">{quiz.title}</h2>
        <div className="mb-4">
          <div className="text-lg font-semibold mb-2">Question {currentSlide + 1} of {quiz.questions.length}</div>
          <div className="text-xl mb-2">{q.question}</div>
          <div className="flex flex-col gap-2">
            {q.options.map((opt, idx) => (
              <div key={idx} className="p-2 border rounded bg-gray-100">{opt.text}</div>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <span className="text-lg font-bold text-red-600">⏱️ {timer}s</span>
        </div>
        <div className={`flex justify-end ${timerActive && "hidden"}`}>
          <div className={`flex justify-end ${timerActive ? "hidden" : ""}`}>
            {currentSlide < quiz.questions.length - 1 ? (
              <button
                onClick={nextSlide}
                disabled={timerActive}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Next
              </button>
            ) : (
              <button
                onClick={finishQuiz}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Finish Quiz
              </button>
            )}
          </div>
        </div>
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Live Answers:</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="option" />
              <Tooltip />
              <Bar dataKey="count" name="Votes" fill="">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm font-bold">Total Votes: {totalVotes}</p>
        </div>
      </div>
    </div>
  );
} 