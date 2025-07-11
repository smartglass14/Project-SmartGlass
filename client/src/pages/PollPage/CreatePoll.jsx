import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { handleApi, API } from "../../services/api";
import { useAuth } from "../../context/AuthContext"
import SessionCreationPopup from "../../components/SessionCreationPopup";
import { X } from 'lucide-react'

export default function CreatePoll() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [sessionCode, setSessionCode] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(()=> {
    if(!auth?.authToken || !auth.user || auth?.user?.role !== "Educator"){
        toast.error("Unauthorized!")
        return auth.user ? navigate('/dashboard') : navigate('/'); 
    }
  }, [auth, navigate])

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length >= 6) return toast.error("Max 6 options allowed");
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return toast.error("At least 2 options required");
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
  };

  const handleSubmit = async () => {
    
    if (!question.trim()) {
        return toast.error("Question is required");
    }
    const trimmed = options.map(o => o.trim()).filter(Boolean);
    if (trimmed.length < 2) {
        return toast.error("Minimum 2 options needed");

    }

    const sessionRes = await handleApi(API.post("/session/create", {sessionType: "Poll"},{
        headers : {
            Authorization : `Bearer ${auth?.authToken}` 
        },
        withCredentials: true
    }))

    if(sessionRes.error){
        toast.error(sessionRes.error.message);
    }
    if(sessionRes.status == 201){
        setSessionCode(sessionRes?.data?.sessionCode);
    }

    const pollData = { question, options: trimmed };
    const res = await handleApi(API.post("/poll/create", { pollData, sessionId: sessionRes?.data?.sessionId },{
        headers:{
            Authorization: `Bearer ${auth?.authToken}`
        },
        withCredentials: true

    }));

    if (res.error) return toast.error(res.error.message);
    if(res.status == 201){
        toast.success(res?.data?.message);
        setShowPopup(true);
    }
};

  return (
    <>
    { showPopup && <SessionCreationPopup onClose={()=> setShowPopup(false)} sessionCode={sessionCode}  /> }
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 px-4 py-8">
        <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-extrabold text-purple-700 mb-6 text-center"> Create a New Poll </h1>

        <div className="mb-5">
          <label className="block text-md font-semibold text-gray-700 mb-1">Poll Question</label>
          <input
            type="text"
            className="w-full text-md font-semibold border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
            value={question}
            autoFocus
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What is your favorite programming language?"
          />
        </div>

        <div className="mb-5">
          <label className="block text-md font-semibold text-gray-700 mb-2">Options</label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                className="flex-1 text-md font-semibold border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(idx)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <X />
                </button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button
              onClick={addOption}
              className="text-sm mt-2 text-blue-500 font-bold hover:underline transition"
            >
             Add option +
            </button>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition shadow-md"
        >
         Create Poll
        </button>
      </div>
    </div>
  </>
  );
}
