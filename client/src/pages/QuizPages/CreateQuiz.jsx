import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { X } from "lucide-react";
import { toast } from 'react-hot-toast'
import {API, handleApi} from "../../services/api"
import { useAuth } from '../../context/AuthContext';
import SessionCreationPopup from "../../components/SessionCreationPopup";
import "swiper/css";

export default function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    {
      question: "",
      options: ["", "", "", ""],
      correctOption: null,
      editingOption: null,
    },
  ]);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sessionCode, setSessionCode] = useState(null);
  const [popUp, setPopUp] = useState(false);
  const {authToken} = useAuth();

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctOption: null,
        editingOption: null,
      },
    ]);
    if (swiperInstance) {
      setTimeout(() => swiperInstance.slideNext(), 0);
    }
  };

  const prevQuestion = () => {
    if (swiperInstance) swiperInstance.slidePrev();
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOptionText = (qIdx, optIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = value;
    setQuestions(updated);
  };

  const setEditing = (qIdx, optIdx) => {
    const updated = [...questions];
    updated[qIdx].editingOption = optIdx;
    setQuestions(updated);
  };

  const finishEditing = (qIdx) => {
    const updated = [...questions];
    updated[qIdx].editingOption = null;
    setQuestions(updated);
  };

  const markAsCorrect = (qIdx, optIdx) => {
    const updated = [...questions];
    updated[qIdx].correctOption = optIdx;
    setQuestions(updated);
  };

  const removeQuestion = (idx)=> {
    setQuestions(questions.filter((_, i)=> i!= idx));
  }

  const checkForError = ()=> {
    if (!title.trim()) {
        toast.error("Please enter a quiz title.");
        return 1;
      }
    
      if (questions.length < 2) {
        toast.error("Minimum two questions are required.");
        return 1;
      }
    
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
    
        if (!q.question.trim()) {
          toast.error(`Question ${i + 1} cannot be empty.`);
          setTimeout(() => swiperInstance?.slideTo(i), 100);
          return 1;
        }
    
        const hasEmptyOption = q.options.some((opt) => !opt.trim());
        if (hasEmptyOption) {
          toast.error(`All options must be filled for Question ${i + 1}.`);
          setTimeout(() => swiperInstance?.slideTo(i), 100);
          return 1;
        }
    
        if (q.correctOption === null || q.correctOption === undefined) {
          toast.error(`Please select a correct option for Question ${i + 1}.`);
          setTimeout(() => swiperInstance?.slideTo(i), 100);
          return 1;
        }
      }
  }

  const handleSubmit = async() => {
    let err = checkForError();
    if(err) return;
    // eslint-disable-next-line no-unused-vars
    const cleanQuestions = questions.map(({ editingOption, ...rest }) => rest);
    const cleanData = {
      title,
      questions: cleanQuestions
    };

    let sessionRes = await handleApi(API.post('/session/create', {sessionType: "Quiz"},{
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
        withCredentials: true
    }
    ));

    if(sessionRes.error){
        toast.error(sessionRes.error.message)
        return;
    }
    
    const res = await handleApi(API.post('/quiz/create', {quizData: cleanData, sessionId: sessionRes?.data?.sessionId},{
        headers: {
            Authorization: `Bearer ${authToken}` 
        },
        withCredentials:true
    } ))
    
    if(res.error){
        toast.error(res.error.message);
    }

    if(res.status == 201){
        toast.success(res.data.message);
        setTitle("")
        setQuestions([
            {
                question: "",
                options: ["", "", "", ""],
                correctOption: null,
                editingOption: null,
            },
        ])
    }
    setSessionCode(sessionRes?.data?.sessionCode);
    setPopUp(true);
  };

  return (
    <>
    {
        sessionCode && popUp &&
        <SessionCreationPopup sessionCode={sessionCode} onClose={()=> setPopUp(false)}/>
    }
    <div className="max-w-3xl mx-auto p-6 mt-4">
      <h2 className="text-3xl font-bold mb-4 text-purple-700">🧠 Create Quiz</h2>

      <input
        type="text"
        placeholder="Enter quiz title"
        className="w-full py-2 px-4 text-lg font-semibold border-2 border-slate-500 rounded-lg mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Swiper
        slidesPerView={1}
        allowTouchMove={false}
        onSwiper={setSwiperInstance}
        onSlideChange={(swiper)=> setActiveIndex(swiper.activeIndex)}
      >
        {questions.map((q, qIdx) => (
          <SwiperSlide key={qIdx}>
            <div className="border-2 border-gray-400 rounded-xl p-5 bg-white shadow-md">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                    Question {qIdx + 1}
                </h3>
                {
                    (qIdx+1) > 2 && 
                    <X className="hover:cursor-pointer" onClick={()=> removeQuestion(qIdx)}/>
                }
              </div>
              <input
                type="text"
                className="w-full py-2 px-3 border rounded-lg mb-4 font-medium"
                placeholder="Enter question"
                value={q.question}
                onChange={(e) => updateQuestion(qIdx, "question", e.target.value)}
              />

              <div className="space-y-2">
                {q.options.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    onClick={() => markAsCorrect(qIdx, optIdx)}
                    className={`rounded-lg px-4 py-2 border transition cursor-pointer ${
                      q.correctOption === optIdx
                        ? "bg-green-100 border-green-500"
                        : "bg-gray-100 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {q.editingOption === optIdx ? (
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) =>
                          updateOptionText(qIdx, optIdx, e.target.value)
                        }
                        onBlur={() => finishEditing(qIdx)}
                        autoFocus
                        className="w-full bg-transparent outline-none"
                      />
                    ) : (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing(qIdx, optIdx);
                        }}
                        className="flex justify-between items-center"
                      >
                        <span>{opt || `Option ${optIdx+1}`}</span>
                        {q.correctOption === optIdx && (
                          <span className="text-green-600 font-bold">✅</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <span className="text-xs font-bold">Double click on any option to select it as correct option for given Question</span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="flex justify-between mt-6 max-sm:flex-col max-sm:gap-5">
        <div className="flex gap-4">
          {(questions.length > 1 && activeIndex>0)  && (
            <button
              onClick={prevQuestion}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg shadow"
            >
              ⬅️ Prev
            </button>
          )}

          {activeIndex === questions.length-1 ? (
            
            <button
                onClick={addQuestion}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow"
            >
                Add Question +
            </button>
            ) : (
            <button
                onClick={() => swiperInstance && swiperInstance.slideNext()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow"
            >
                Next ➡️
            </button>
            )}
        </div>

        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow"
        >
          Create Quiz
        </button>
      </div>
    </div>
    </> 
  );
}