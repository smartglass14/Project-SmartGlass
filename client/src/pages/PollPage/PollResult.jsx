import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API, handleApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useSocket } from "../../services/socket";

export default function PollResult() {
  const { code } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const socket = useSocket();
  const [poll, setPoll] = useState(null);

  useEffect(() => {
    const fetchPollResult = async () => {
      if(!auth?.authToken || !auth?.user){
        toast.error("login to access this page");
        return
      }

      const res = await handleApi(API.get(`/poll/result/${code}`,{
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
        setPoll(res?.data?.poll)
      };
    };
    fetchPollResult();
  }, [code, navigate, auth]);

  useEffect(()=> {
    if(!socket) return;

    socket.emit('join-room', code);
    socket.on('poll-update', handlePollUpdate)

    return ()=> {
        socket.off('join-room', code);
        socket.off('poll-update', handlePollUpdate);
    }

  }, [socket, code])

  const handlePollUpdate = (updatedOption) => {
    console.log(updatedOption);

    setPoll((prevPoll) => {
      if (!prevPoll) return prevPoll;

      const updatedOptions = prevPoll.options.map((opt) => {
        if (opt._id === updatedOption._id) {
          return { ...opt, votes: updatedOption.votes };
        }
        return opt;
      });

      return {
        ...prevPoll,
        options: updatedOptions,
      };
    });
  };

  if (!poll) return <div className="text-center mt-10">Loading result...</div>;

  const data = poll.options.map((opt) => ({
    name: opt.text,
    votes: opt.votes || 0,
  }));

  const totalVotes = data.reduce((sum, d) => sum + d.votes, 0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-100 via-purple-100 to-slate-200 p-6">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between">
            <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">
            Poll Result
            </h2>
            <p className="text-2xl font-bold text-purple-700 "># { code }</p>
        </div>

        <h3 className="text-lg font-semibold mb-4 text-gray-700 text-center">
          {poll.question}
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Bar dataKey="votes" name="Votes" fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>

        <p className="text-center text-sm mt-4 font-semibold text-gray-600">
          Total Votes: {totalVotes}
        </p>
        <p className="text-xs italic font-bold my-2">Created by: {poll?.session?.educator?.name}</p>
      </div>
    </div>
  );
}
