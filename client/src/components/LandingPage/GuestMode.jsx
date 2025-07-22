import  { useState } from 'react';
import {toast} from 'react-hot-toast'
import {API, handleApi} from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function GuestMode() {

  const navigate = useNavigate();
  const { provideGuestAuth } = useAuth();

  const [sessionCode, setSessionCode] = useState('');
  const [name, setName] = useState('');
  const [openPopUp, setOpenPopUp] = useState(false);
  const [sessionType, setSessionType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sessionCode.trim()) {
      toast.error('Session code is required');
      return;
    }
    if (!/^\w{6}$/.test(sessionCode)) {
      toast.error('Session code must be exactly 6 characters');
      return;
    }
    fetchSession();
  };
 
  const fetchSession = async()=> {
    let res = await handleApi(API.get(`/session/${sessionCode}`));
    if(res.error){
        toast.error(res.error.message);
    }
    if(res.status == 200){
        setSessionType(res.data.sessionType);
        setOpenPopUp(true)
    }
  }

  const createGuestAuth = async(e)=> {
    e.preventDefault();

    if(name == "") return toast.error("Please Enter Your Name!")
    setLoading(true);

    let res = await handleApi(API.post('/auth/guest', {name, sessionCode}));

    if(res.error){
        toast.error(res.error.message)
    }
    if(res.status == 200){
        provideGuestAuth(res.data)
        setName("");
        setSessionCode("");
        setOpenPopUp(false);

        if(sessionType == "Poll"){
            navigate(`/poll/${sessionCode}`)
        } else if(sessionType == "Quiz"){
            navigate(`/quiz/${sessionCode}`)
        }else{
            navigate(`/join-qna/${sessionCode}`)
        }
    }

    setLoading(false);
  }

  
    if(openPopUp){
        return (
        <div className="fixed inset-0 z-50 bg-slate-500/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold mb-4 text-purple-700 ">Enter Your Name</h2>
                <X className="mb-3 hover:cursor-pointer" onClick={()=> setOpenPopUp(false)} />
            </div>
            <form onSubmit={createGuestAuth}>
                <input
                type="text"
                placeholder="Enter Your Name..."
                autoFocus={true}
                value={name}
                onChange={(e) => setName(e.target.value)}
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
        )
    }

  return (
    <>
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col sm:flex-row items-center justify-center gap-2 sm:bg-gradient-to-r from-indigo-200  via-purple-100 to-blue-50 py-3 px-4 rounded-md shadow"
      style={{ maxWidth: 600, margin: '0 auto' }}
    >
      <span className="text-gray-700 text-sm sm:text-base whitespace-nowrap font-bold">
        Want to Join SmartClass?
      </span>
      <input
        type="text"
        placeholder="Enter your Session Code here..."
        value={sessionCode}
        onChange={(e) => setSessionCode(e.target.value)}
        className="flex-1 px-2 py-1 border rounded focus:outline-none focus:border-none focus:ring-2 focus:ring-indigo-400 text-sm"
        style={{ minWidth: 120 }}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition text-sm max-sm:w-48"
      >
        Join as Guest
      </button>
    </form>
    </>
  );
};