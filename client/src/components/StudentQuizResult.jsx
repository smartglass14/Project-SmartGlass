import { Link } from "react-router-dom";

export default function StudentQuizResult({ userAnswers, questions, isLoggedIn=false }) {

    if (!userAnswers || !questions) return null;
  
    const totalQuestions = questions.length;
    userAnswers = userAnswers.filter((que=> que.selectedOption !== "Skipped"));
      
    const score = userAnswers.reduce((acc, ans) => {
      return acc + (ans.selectedOption === ans.correctOption ? 1 : 0);
    }, 0);
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Quiz Completed</h2>
          <p className="text-xl font-medium text-gray-700">
            You scored <span className="text-purple-600 font-bold">{score}</span> out of <span className="font-bold">{totalQuestions}</span>
          </p>
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
  