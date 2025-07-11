export default function StudentQuizResult({ userAnswers, questions }) {
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
        </div>
      </div>
    );
  }
  