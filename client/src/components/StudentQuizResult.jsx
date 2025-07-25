import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { submitQuizResult } from "../services/leaderboardAPI";
import toast from "react-hot-toast";

export default function StudentQuizResult({ userAnswers, questions, isLoggedIn=false, code, startTime, endTime, timeSpentPerQuestion }) {
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      const submitResults = async () => {
        if (!isLoggedIn || submitted || submitting || !code || !startTime || !endTime || !userAnswers || !questions) return;

        setSubmitting(true);
        try {
          const filteredAnswers = userAnswers.filter((que => que.selectedOption !== "Skipped"));
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
              setSubmitted(true);
            }
          } else {
            toast.success("Results submitted successfully!");
            localStorage.removeItem(`quiz-progress-${code}`);
            localStorage.setItem("isServiceUsed", true);
            setSubmitted(true);
          }
        } catch (err) {
          console.log(err);
          toast.error("Failed to submit results");
        } finally {
          setSubmitting(false);
        }
      };

      submitResults();
    }, [isLoggedIn, code, startTime, endTime, userAnswers, submitted, timeSpentPerQuestion, questions, submitting]);

    if (!userAnswers || !questions) return null;
  
    const totalQuestions = questions.filter((q)=> q.type==='mcq').length;
    const filteredAnswers = userAnswers.filter((que => que.selectedOption !== "Skipped"));
      
    const score = filteredAnswers.reduce((acc, ans, idx) => {
      const question = questions[idx];
      if (question.type === 'mcq' && ans.selectedOption === ans.correctOption) {
        return acc + 1;
      }
      return acc;
    }, 0);
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center flex flex-col gap-4">
          <h2 className="text-3xl font-bold text-green-600">🎉 Quiz Completed</h2>
          <p className="text-xl font-medium text-gray-700">
            You scored <span className="text-purple-600 font-bold">{score}</span> out of <span className="font-bold">{totalQuestions}</span>
          </p>
          {submitting && (
            <p className="text-sm text-blue-600 mt-4">Submitting results to leaderboard...</p>
          )}
          {
            submitted && 
              <Link to={`/leaderboard/${code}`} className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-3 rounded-lg font-semibold" >View Leaderboard </Link>
          }
        </div>
      </div>
    );
  }
  