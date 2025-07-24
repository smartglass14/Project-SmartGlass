import "swiper/css";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useTimer } from "react-timer-hook";
import { toast } from 'react-hot-toast';
import { useParams, Link } from 'react-router-dom';
import { API, handleApi } from '../../services/api.js';
import { LoaderCircle } from "lucide-react";
import { useSocket } from "../../services/socket.js";
import StudentQuizResult from '../../components/StudentQuizResult.jsx';
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import StudentTextAns from '../../components/QuizComponent/studentTextAns';

export default function QuizPage() {
  const { code } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const {isLoggedIn, guestUser, user} = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [swiper, setSwiper] = useState(null);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState([]);
  const [expired, setExpired] = useState(false);
  const [textAns, setTextAns] = useState('')

  const totalQuestions = quiz?.questions?.length;
  const currentQuestion = quiz?.questions?.[activeQuestion];

  const defaultTime = new Date();
  defaultTime.setSeconds(defaultTime.getSeconds() + 30);

  const { seconds, restart, pause } = useTimer({
    expiryTimestamp: defaultTime,
    onExpire: () => {
      saveAnswer("Skipped");
      goToNextQuestion();
    }
  });

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      const res = await handleApi(API.get(`/quiz/${code}`));
      if (res.error) {
        if (res.error.message && res.error.message.toLowerCase().includes("expired")) {
          setExpired(true);
          setLoading(false);
          return;
        }
        toast.error(res.error.message);
        return isLoggedIn? navigate('/dashboard') : navigate("/");
      } 

      if(res.status == 200){
        setQuiz(res.data.quiz);
        setStartTime(new Date());
      }
      setLoading(false);
    };
    fetchQuiz();
  }, [code, navigate,isLoggedIn]);

  useEffect(() => {
    if(finished) return;

    const saved = userAnswers[activeQuestion];
    setSelectedOption(saved?.answerGiven === "Skipped" ? "" : saved?.answerGiven || "");
    
    const newTime = new Date();
    newTime.setSeconds(newTime.getSeconds() + 30);
    restart(newTime);
  }, [activeQuestion, restart, userAnswers, finished]);

  useEffect(()=> {
    if(!socket || !quiz){
      return;
    }
    socket.emit('join-room', code); 

    return ()=> {
      socket.off('join-room');
      socket.off('submit-answer');
      socket.off('submit-text-ans');
    }
  }, [socket, code, quiz])

  useEffect(()=>{ 
    let activeQue = localStorage.getItem("activeQue");
    if(activeQue){
      setTimeout(() => swiper?.slideTo(activeQue), 100);
    }
  },[swiper])


  const submitTextAnswer = (textAnswer, questionId) => {
    try {
      let data = { roomId: code, answer: { questionId, textAnswer }};
      if ((isLoggedIn && user?.name) || guestUser?.guestName) {
        data.answer.studentName = user?.name || guestUser.guestName;
      }
      socket.emit("submit-text-ans", { data });
      
    } catch (err) {
      console.log(err);
    }
  };

  const saveAnswer = () => {
    if(currentQuestion.type !=='mcq') return;
    const answer = currentQuestion?.options[selectedOption]?._id || "Skipped";
    const updated = [...userAnswers];
    updated[activeQuestion] = {
      questionId: currentQuestion._id,
      selectedOption: answer,
      correctOption: currentQuestion.options[currentQuestion?.correctOption]._id
    };
    // Track time spent on this question
    const questionTime = 30 - seconds; // Time spent = total time - remaining time
    const updatedTimeSpent = [...timeSpentPerQuestion];
    updatedTimeSpent[activeQuestion] = questionTime;

    localStorage.setItem(
      `quiz-progress-${code}`,
      JSON.stringify({
        userAnswers: updated,
        activeQuestion,
        timeSpentPerQuestion: updatedTimeSpent,
        startTime
      })
    );

    localStorage.setItem("activeQue", activeQuestion + 1);
    setUserAnswers(updated);
    setTimeSpentPerQuestion(updatedTimeSpent);
    try {
      let data = { roomId: code, answer: updated[activeQuestion] };
      socket.emit("submit-answer", { data });
    } catch (err) {
      console.log(err);
    }
  };

  const handleConfirm = () => {
    if (currentQuestion.type === 'text') {
      if(textAns.length > 200) return toast.error("Answer length must be less then 200");
      submitTextAnswer(textAns, currentQuestion._id);
      setTextAns('');
      goToNextQuestion();
      return;
    }

    if (selectedOption == null) return;
    saveAnswer();
    goToNextQuestion();
  };

  const goToNextQuestion = () => {
    if (activeQuestion + 1 < totalQuestions) {
      swiper?.slideNext();
    } else {
      setFinished(true);
      setEndTime(new Date());
      pause();
      localStorage.removeItem("activeQue");
    }
  };

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">You are late!</h2>
          <p className="mb-6 text-gray-700">Quiz expired. You can see the leaderboard.</p>
          <Link to={`/leaderboard/${code}`} className="bg-yellow-500 hover:bg-yellow-400 text-white py-2 px-4 rounded-lg font-semibold">
            View Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  return (

  <> 
    { finished && <StudentQuizResult 
      userAnswers={userAnswers} 
      questions={quiz?.questions} 
      isLoggedIn={isLoggedIn? isLoggedIn : guestUser? true : false} 
      code={code}
      startTime={startTime}
      endTime={endTime}
      timeSpentPerQuestion={timeSpentPerQuestion}
    /> }
    
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl">
        {loading ? (
          <div className="flex justify-center items-center text-2xl">
            <LoaderCircle className="animate-spin mx-2" size={35} />
            Loading...
          </div>
        ) : (
          <>
            <div className="flex max-sm:flex-col sm:justify-between sm:items-center">
              <h2 className="text-2xl font-bold mb-4 text-purple-700">{quiz?.title}</h2>
              <p className="text-xl font-bold text-purple-700">#{code}</p>
            </div>

            <Swiper
              slidesPerView={1}
              onSwiper={setSwiper}
              onSlideChange={(s) => setActiveQuestion(s.activeIndex)}
              allowTouchMove={false}
            >
              {quiz?.questions?.map((q, idx) => (
                <SwiperSlide key={q._id}>
                  <div className="p-4">
                    <div className="flex justify-between mb-2 text-sm text-gray-600">
                      <p>Question {idx + 1} of {totalQuestions}</p>
                      <p className="text-red-500 font-semibold">⏱️ {seconds}s</p>
                    </div>
                    <h3 className="font-medium text-lg mb-4">{q.question}</h3>
                    {q.type === 'mcq' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt, idx2) => (
                          <div
                            key={opt._id}
                            className={`cursor-pointer px-4 py-3 rounded-xl border transition-all
                              ${selectedOption === idx2
                                ? "bg-purple-100 border-purple-500"
                                : "bg-white border-gray-300 hover:border-purple-400"}
                            `}
                            onClick={() => setSelectedOption(idx2)}
                          >
                            {opt.text}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <StudentTextAns
                        value={textAns}
                        onChange={setTextAns}
                        disabled={finished}
                      />
                    )}
                    <button
                      onClick={handleConfirm}
                      className="mt-6 w-full bg-green-500 text-white font-semibold py-2 rounded-xl hover:bg-green-600 transition"
                      disabled={q.type === 'mcq' ? selectedOption == null : false}
                    >
                      {idx + 1 === totalQuestions ? "Finish Quiz" : "Confirm & Next"}
                    </button>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </>
        )}
      </div>
    </div>
  </>
  );
}
