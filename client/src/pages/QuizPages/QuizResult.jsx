import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { handleApi, API } from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../services/socket";
import TextAnsPopUp from "../../components/QuizComponent/TextAnsPopUp";

export default function QuizResult() {
  const auth = useAuth();
  const socket = useSocket();
  const { code } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [showTextAnsPopup, setShowTextAnsPopup] = useState(false);
  const [popupQuestionId, setPopupQuestionId] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if(!auth?.authToken || !auth?.user){
        toast.error("login to access this page");
        return
      }

      const res = await handleApi(API.get(`/quiz/result/${code}`,{
        headers: {
          Authorization: `Bearer ${auth?.authToken}`
        },
      }));

      if (res.error) {
        toast.error(res.error.message);
        if (res.status === 402){
           navigate("/dashboard");
           return;
          }
      }

      if (res.status === 200){
        setQuiz(res?.data?.quiz)
      };
    };
    fetchQuiz();
  }, [code, navigate, auth]);

  useEffect(()=> {
    if(!socket ){
      return;
    }

    socket.emit('join-room', code);
    socket.on('update-answer', handleQuizUpdate)
    socket.on('update-text-ans', handleTextAnsUpdate)

    return ()=> {
      socket.off('join-room');
      socket.off('update-answer', handleQuizUpdate);
      socket.off('update-text-ans', handleTextAnsUpdate)

    }

  },[socket, code])

  const handleQuizUpdate = (data)=> {
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
  }
  
  const handleTextAnsUpdate = (data) => {
    const { questionId, studentName, answer } = data;
    setQuiz((prevQuiz) => {
      if (!prevQuiz) return prevQuiz;
      const updatedQuestions = prevQuiz.questions.map((q) => {
        if (q._id !== questionId) return q;

        const updatedAnswers = Array.isArray(q.answersGivenBy)
          ? [...q.answersGivenBy, { studentName, answer }]
          : [{ studentName, answer }];
        return { ...q, answersGivenBy: updatedAnswers };
      });
      return { ...prevQuiz, questions: updatedQuestions };
    });
  };

  if (!quiz) return null;

  const answerDistributions = quiz.questions.map((q) => {
    if (q.type === 'mcq') {
      const data = q.options.map((opt, idx) => ({
        option: opt.text,
        count: opt.votes || 0,
        fill: idx === q.correctOption ? "#22c55e" : "#8B5CF6",
      }));
      const totalVotes = data.reduce((sum, opt) => sum + opt.count, 0);
      return {
        id: q._id,
        type: 'mcq',
        question: q.question,
        correct: q.correctOption,
        totalVotes,
        data,
      };
    } else {
      // For text questions, returning the answers only
      return {
        id: q._id,
        type: 'text',
        question: q.question,
        answers: q.answersGivenBy || [],
      };
    }
  });

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-purple-700 mb-6">
            📊 Live Quiz Result
          </h2>
          <p className="text-md text-gray-700 font-bold mb-4">Code: {code}</p>
        </div>
        <p className="font-bold text-purple-700 text-3xl mb-5">{quiz.title}</p>

        {answerDistributions.map((dist, idx) => (
          <div key={dist.id} className="mb-10">
            <h4 className="font-semibold mb-2">
              Q{idx + 1}: {dist.question}
            </h4>
            {dist.type === 'mcq' ? (
              <div className="sm:px-20 sm:pt-5">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dist.data}>
                    <XAxis dataKey="option" />
                    <Tooltip />
                    <Bar dataKey="count" name="Votes"  fill="">
                    {
                      dist.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))
                    }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm font-bold" >Total Votes: {dist.totalVotes}</p>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-2 sm:px-20 sm:pt-5">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold flex justify-center items-center gap-3"
                  onClick={() => {
                    setPopupQuestionId(dist.id);
                    setShowTextAnsPopup(true);
                  }}
                >
                  <span>See Answers</span>
                  <span className="rounded-full font-bold text-xs bg-gray-700 py-1 px-2">
                    {dist.answers.length}
                  </span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {showTextAnsPopup && popupQuestionId && (
        <TextAnsPopUp
          answers={
            quiz.questions.find((q) => q._id === popupQuestionId)?.answersGivenBy || []
          }
          onClose={() => {
            setShowTextAnsPopup(false);
            setPopupQuestionId(null);
          }}
        />
      )}
    </div>
  );
}
