import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { submitQuizResult } from "../services/leaderboardAPI";
import toast from "react-hot-toast";

export default function StudentQuizResult({ userAnswers, questions, isLoggedIn=false, code, startTime, endTime, timeSpentPerQuestion }) {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      const submitResults = async () => {
        if (!isLoggedIn || submitted || submitting || !code || !startTime || !endTime || !userAnswers || !questions) return;

        setSubmitting(true);
        try {
          const filteredAnswers = userAnswers.filter((que => que.selectedOption !== "Skipped"));
          console.log(filteredAnswers);
          const quizData = {
            sessionCode: code,
            answers: filteredAnswers.map((answer, index) => {
              const question = questions[index];
              let selectedOptionIndex = -1;
              if (answer.selectedOption !== "Skipped") {
                selectedOptionIndex = question.options.findIndex(opt => opt._id === answer.selectedOption);
              }
              return {
                selectedOption: selectedOptionIndex,
                questionIndex: index
              };
            }),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            timeSpentPerQuestion: timeSpentPerQuestion || []
          };

          const res = await submitQuizResult(quizData);
          if (res.error) {
            toast.error(res.error.message || "Failed to submit results");
            if (res.error.message === "Quiz already submitted") {
              localStorage.removeItem(`quiz-progress-${code}`);
              navigate(`/leaderboard/${code}`);
            }
          } else {
            setSubmitted(true);
            toast.success("Results submitted successfully!");
            localStorage.removeItem(`quiz-progress-${code}`);
            localStorage.setItem("isServiceUsed", true);
            navigate(`/leaderboard/${code}`);
          }
        } catch (error) {
          console.error("Error submitting results:", error);
          toast.error("Failed to submit results");
        } finally {
          setSubmitting(false);
        }
      };

      submitResults();
    }, [isLoggedIn, code, startTime, endTime, userAnswers, submitted, timeSpentPerQuestion, navigate, questions, submitting]);

    if (!userAnswers || !questions) return null;
  
    const totalQuestions = questions.length;
    const filteredAnswers = userAnswers.filter((que => que.selectedOption !== "Skipped"));
      
    const score = filteredAnswers.reduce((acc, ans) => {
      return acc + (ans.selectedOption === ans.correctOption ? 1 : 0);
    }, 0);
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Quiz Completed</h2>
          <p className="text-xl font-medium text-gray-700">
            You scored <span className="text-purple-600 font-bold">{score}</span> out of <span className="font-bold">{totalQuestions}</span>
          </p>
          {submitting && (
            <p className="text-sm text-blue-600 mt-4">Submitting results to leaderboard...</p>
          )}
          <div className="mt-5">
            {!isLoggedIn &&  <p className="text-lg font-semi-bold mb-3"> To access more features </p> }
            {isLoggedIn? 
              <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-3 rounded-lg font-semibold" > Dashboard </Link> :
              <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-3 rounded-lg font-semibold" > Login </Link>
            }
          </div>
        </div>
      </div>
    );
  }
  