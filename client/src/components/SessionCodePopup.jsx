import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { API, handleApi } from "../services/api"; 
import { X } from "lucide-react";

export default function SessionCodePopup({ onClose, role }) {
  const [sessionCode, setSessionCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionCode) return toast.error("Please enter a session code");
    if(sessionCode.length != 6) return toast.error("Session Code must have 6 character");

    setLoading(true);
    const res = await handleApi(API.get(`/session/${sessionCode}`));
    setLoading(false);

    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    if(res.status == 200){
        const type = res.data.sessionType;

       if(role == 'Student'){
            if(type == 'Quiz'){
                navigate(`/quiz/${sessionCode}`);
            }else{
                navigate(`/poll/${sessionCode}`) 
            }
       }else{
            if(type == 'Quiz'){
                navigate(`/results/quiz/${sessionCode}`);
            }else{
                navigate(`/results/poll/${sessionCode}`) 
            }
       }
    }

    onClose?.(); 
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-500/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold mb-4 text-purple-700 ">Enter Session Code</h2>
            <X className="mb-3 hover:cursor-pointer" onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter code..."
            autoFocus={true}
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value.trim().toUpperCase())}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition font-semibold"
          >
            {loading ? "Validating..." : "Join Session"}
          </button>
        </form>
      </div>
    </div>
  );
}
