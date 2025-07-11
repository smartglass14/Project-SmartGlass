import "swiper/css";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useTimer } from "react-timer-hook";
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { API, handleApi } from '../../services/api.js';
import { LoaderCircle, RouteOff } from "lucide-react";
import { useSocket } from "../../services/socket.js";
import StudentQuizResult from '../../components/StudentQuizResult.jsx';
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function QuizPage() {
  const { code } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const {isLoggedIn} = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [swiper, setSwiper] = useState(null);
  const [finished, setFinished] = useState(false);

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
        toast.error(res.error.message);
        return isLoggedIn? navigate('/dashboard') : navigate("/");;
      } 

      if(res.status == 200){
        setQuiz(res.data.quiz);
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
    }
  }, [socket, code, quiz])

  useEffect(()=>{ 
    let activeQue = localStorage.getItem("activeQue");
    if(activeQue){
      setTimeout(() => swiper?.slideTo(activeQue), 100);
    }
  },[swiper])

  const saveAnswer = () => {
    const answer = currentQuestion?.options[selectedOption]?._id || "Skipped";
    const updated = [...userAnswers];
    updated[activeQuestion] = {
      questionId: currentQuestion._id,
      selectedOption: answer,
      correctOption: currentQuestion.options[currentQuestion?.correctOption]._id
    };
    localStorage.setItem("activeQue", activeQuestion+1)
    setUserAnswers(updated);

    try{ 
      let data = {roomId: code, answer: updated[activeQuestion]}
      socket.emit('submit-answer', { data })
    }catch(err){
      console.log(err);
    }
  };

  const handleConfirm = () => {
    if (selectedOption == null) return;
    saveAnswer();
    goToNextQuestion();
  };

  const goToNextQuestion = () => {
    if (activeQuestion + 1 < totalQuestions) {
      swiper?.slideNext();
    } else {
      setFinished(true);
      pause();
      localStorage.removeItem("activeQue");
    }
  };


  return (

  <> 
    { finished && <StudentQuizResult userAnswers={userAnswers} questions={quiz?.questions} isLoggedIn={isLoggedIn} /> }
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt, idx) => (
                        <div
                          key={opt._id}
                          className={`cursor-pointer px-4 py-3 rounded-xl border transition-all
                            ${selectedOption === idx
                              ? "bg-purple-100 border-purple-500"
                              : "bg-white border-gray-300 hover:border-purple-400"}
                          `}
                          onClick={() => setSelectedOption(idx)}
                        >
                          {opt.text}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleConfirm}
                      className="mt-6 w-full bg-green-500 text-white font-semibold py-2 rounded-xl hover:bg-green-600 transition"
                      disabled={selectedOption == null}
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
