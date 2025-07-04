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

export default function QuizResult({ data, questions }) {
  const score = data.reduce((acc, ans) => {
    const correct =
      ans.type === "text"
        ? ans.answerGiven?.toLowerCase().includes(ans.answer.toLowerCase())
        : ans.answerGiven === ans.answer;
    return acc + (correct ? 1 : 0);
  }, 0);

  const answerDistributions = questions
    .filter(q => q.type === "mcq")
    .map((q) => {
      const dist = {};
      q.options.forEach(opt => {
        dist[opt] = data.filter(ans => ans.id === q.id && ans.answerGiven === opt).length;
      });
      return {
        id: q.id,
        question: q.question,
        data: q.options.map(opt => ({ option: opt, count: dist[opt] })),
      };
    });

  const scoreTimeData = data.map((q, i) => ({
    question: `Q${i + 1}`,
    time: q.timeTaken,
    correct:
      q.type === "text"
        ? q.answerGiven?.toLowerCase().includes(q.answer.toLowerCase())
        : q.answerGiven === q.answer
        ? 1
        : 0,
  }));

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Quiz Completed</h2>
        <p className="text-lg mb-6">Your Score: {score} / {data.length}</p>

        {/* Answer Distribution for Each Question */}
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
                <Bar dataKey="count" fill="#8B5CF6" />
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
