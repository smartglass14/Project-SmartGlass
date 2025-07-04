import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ChartSection({ distribution, timeStats }) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 mt-10">
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-bold mb-4">📊 Answer Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={distribution}>
            <XAxis dataKey="option" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-bold mb-4">⏱️ Score vs Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeStats}>
            <XAxis dataKey="question" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" fill="#82ca9d" />
            <Bar dataKey="timeTaken" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
