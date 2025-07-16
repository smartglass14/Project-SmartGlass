import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParams, Link } from "react-router-dom";
import { API, handleApi } from "../../services/api";
import toast from "react-hot-toast";
import { Crown, ArrowLeft } from "lucide-react";

const rankColors = [
  "bg-yellow-400 text-yellow-900 border-yellow-500",
  "bg-gray-300 text-gray-800 border-gray-400",
  "bg-orange-400 text-orange-900 border-orange-500"
];

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function Leaderboard() {
  const { code } = useParams();
  const { user, authToken } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [myScore, setMyScore] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const res = await handleApi(API.get(`/quiz/leaderboard/${code}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      }));
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      setLeaderboard(res.data.leaderboard);
      setMyRank(res.data.myRank);
      setMyScore(res.data.myScore);
    };
    fetchLeaderboard();
  }, [code, authToken]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 p-2 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 max-w-2xl w-full border border-gray-200 relative">
        <Link to="/dashboard" className="absolute left-3 sm:left-6 top-3 sm:top-6 flex items-center gap-1 text-blue-600 hover:underline text-xs sm:text-sm font-semibold">
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-center text-purple-700 mb-2 tracking-tight flex items-center justify-center gap-2">
          <Crown className="text-yellow-400" size={28} /> <span className="hidden sm:inline">Leaderboard</span><span className="sm:hidden">Top Scores</span>
        </h2>
        <p className="text-center text-gray-500 mb-6 sm:mb-8 text-xs sm:text-base">Quiz Code: <span className="font-mono text-purple-600">{code}</span></p>

        {myRank !== null && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gradient-to-r from-yellow-100 via-purple-100 to-blue-100 border-l-4 border-yellow-500 rounded-xl flex flex-col items-center text-xs sm:text-lg">
            <p className="font-bold text-yellow-700">
              Your Rank: <span className="text-lg sm:text-2xl">{myRank + 1}</span> &nbsp;|&nbsp; Score: <span className="text-lg sm:text-2xl">{myScore}</span>
            </p>
          </div>
        )}

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-separate border-spacing-y-2 text-xs sm:text-base">
            <thead>
              <tr>
                <th className="py-2 px-2 text-xs sm:text-lg">Rank</th>
                <th className="py-2 px-2 text-xs sm:text-lg">Student</th>
                <th className="py-2 px-2 text-xs sm:text-lg">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => {
                const isMe = entry.userId === user._id;
                const rankClass =
                  idx < 3
                    ? rankColors[idx] + " border-2 "
                    : "bg-gray-100 text-gray-700 border border-gray-200";
                return (
                  <tr
                    key={entry.userId}
                    className={`transition-all ${isMe ? "ring-2 ring-purple-400 scale-[1.03] font-bold" : ""}`}
                  >
                    <td className={`py-2 px-2 rounded-l-xl text-center ${rankClass}`}>{idx < 3 ? <Crown size={16} className="inline -mt-1 mr-1" /> : null}{idx + 1}</td>
                    <td className={`py-2 px-2 flex items-center gap-2 sm:gap-3 font-semibold ${rankClass}`}>
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg font-bold shadow ${isMe ? "bg-purple-200 text-purple-800" : "bg-white text-gray-700"}`}>{getInitials(entry.name)}</div>
                      <span className="truncate max-w-[80px] sm:max-w-none">{entry.name}</span>
                      {isMe && <span className="ml-1 sm:ml-2 px-1 sm:px-2 py-0.5 bg-purple-200 text-purple-700 rounded text-[10px] sm:text-xs font-bold">You</span>}
                    </td>
                    <td className={`py-2 px-2 rounded-r-xl text-center ${rankClass}`}>{entry.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 