import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API, handleApi } from '../../services/api.js';
import { LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../services/socket";

export default function PollPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const {isLoggedIn} = useAuth();
  const socket = useSocket();

  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      setLoading(true);
      const res = await handleApi(API.get(`/poll/${code}`));
      if (res.error) {
        if (res.error.message && res.error.message.toLowerCase().includes("expired")) {
          setExpired(true);
          setLoading(false);
          return;
        }
        toast.error(res.error.message);
        return isLoggedIn ? navigate("/dashboard") : navigate("/");
      }
  
      if (res.status === 200) {
        const fetchedPoll = res?.data?.poll;
        setPoll(fetchedPoll);
  
        if (new Date(fetchedPoll?.session?.expiresAt) <= new Date()) {
          setExpired(true);
        }
      }
      setLoading(false);
    };
  
    fetchPoll();
  }, [code, navigate, isLoggedIn]);

  useEffect(()=> {
    if(!socket){
        return
    }

    socket.emit('join-room', code);
    socket.on('poll-update')

    return ()=> {
        socket.off('join-room');
        socket.off('submit-vote');
    }
  },[code, socket])
  
  const handleVote = async () => {
    if (selected === null) {
      toast.error("Please select an option.");
      return;
    }
    const payload = {pollId: poll._id, selectedOption: selected};
    socket.emit('submit-vote', ({roomId:code, payload}));

    toast.success("vote submitted!")
    setHasVoted(true)
    localStorage.setItem('isServiceUsed', true);
  };

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">You are late!</h2>
          <p className="mb-6 text-gray-700">Poll expired. You can see the result.</p>
          <Link to={`/results/poll/${code}`} className="bg-yellow-500 hover:bg-yellow-400 text-white py-2 px-4 rounded-lg font-semibold">
            View Result
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
        <LoaderCircle className="animate-spin mx-2" size={35} />
        Loading...
      </div>
    );
  }

  if (!poll) return <div className="text-center mt-10">Loading poll...</div>;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-100 via-purple-100 to-slate-200 p-4">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">{poll.question}</h2>

        <div className="flex flex-col gap-4">
              {poll?.options?.map((opt, idx) => (
                <div key={idx}
                  className={
                    `text-start font-semibold px-4 py-2 border-2 border-slate-500 rounded-lg text-base sm:text-lg 
                    hover:cursor-pointer transition-all duration-200 ${selected !== opt._id ? "text-gray-700 bg-white" 
                    : "text-white bg-purple-400" } ${expired || hasVoted ? "opacity-50 pointer-events-none" : ""}`
                }
                  onClick={() => !expired && setSelected(opt._id)}
                >
                  {opt.text}
                </div>
              ))}
            </div>

        <button
          onClick={handleVote}
          disabled={hasVoted}
          className= {`w-full ${!selected && 'hidden'} bg-purple-600 text-white py-2 mt-4 text-md font-semibold rounded hover:bg-purple-700 transition `}
        >
          {hasVoted ? "Voted!" : "Submit Vote"}
        </button>
      </div>
    </div>
  );
}
