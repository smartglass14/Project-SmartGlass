import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function QuizResult({ answers, quiz }) {
  const score = answers.reduce((acc, ans) => {
    return acc + (ans.selectedOption === ans.correctOption ? 1 : 0);
  }, 0);

  const answerDistributions = quiz.questions.map((q) => {
    const dist = {};
    q.options.forEach((opt) => {
      dist[opt._id] = answers.filter(
        (ans) => ans.questionId === q._id && ans.selectedOption === opt._id
      ).length;
    });

    return {
      id: q._id,
      question: q.question,
      data: q.options.map((opt) => ({
        option: opt.text,
        count: dist[opt._id] || 0,
      })),
    };
  });

  const scoreTimeData = answers.map((ans, idx) => ({
    question: `Q${idx + 1}`,
    correct: ans.selectedOption === ans.correctOption ? 1 : 0,
    time: ans.timeTaken || 30, // default if not tracked
  }));

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Quiz Completed</h2>
        <p className="text-lg mb-6">Your Score: {score} / {quiz.questions.length}</p>

        {/* Per-question Vote Distribution */}
        {answerDistributions.map((dist) => (
          <div key={dist.id} className="mb-10">
            <h4 className="font-semibold mb-2">{dist.question}</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dist.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="option" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8B5CF6" name="Votes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}

        {/* Score vs Time */}
        <div>
          <h4 className="font-semibold mb-2">⏱️ Score vs Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={scoreTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="question" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="time" fill="#60A5FA" name="Time Taken (s)" />
              <Bar dataKey="correct" fill="#34D399" name="Correct (1/0)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
