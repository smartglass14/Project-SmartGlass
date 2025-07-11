import { useEffect } from "react";
import { Link } from "react-router-dom";
import RolePopup from "../../components/RolePopup";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import {API, handleApi} from "../../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [showRolePopup, setShowRolePopup] = useState(false);

  useEffect(()=> {
    if (auth.user && !auth.user.role) {
      setShowRolePopup(true);
    }
  },[auth.user])

  const saveRole = async (role) => {
    if (!role) return;
    try {
      let res = await handleApi(API.put("/auth/role", { role }, {
        headers: {
          "Authorization": `Bearer ${auth.authToken}`,
        },
        withCredentials: true }));

        if (res.status === 200) {
          auth.loginContext( res.data.user, auth.authToken);
          setShowRolePopup(false);
          toast.success(res.data.message);
          navigate('/dashboard');
       }

      if(res.error){
        toast.error(res.error.message || "Failed to save role. Please try again.");
      }

    } catch (error) {
      console.error("Error saving role:", error);
    }
  };

  return (
   <>
      {showRolePopup && <RolePopup onConfirm={saveRole} onClose={()=> setShowRolePopup(false)}/> }

    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 px-4 py-20">
      <div className="max-w-4xl mx-auto text-center bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-gray-200">
        <h1 className="text-5xl sm:text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-6 animate-fade-in">
         Welcome to SmartGlass
        </h1>
        <p className="text-gray-800 text-lg sm:text-base mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in delay-100">
          Easily upload your documents or chat with our AI assistant. Use the menu or explore the options below to get started!
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-14">
          <Link
            to="/upload"
            className="px-6 py-3 text-white rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto text-center"
          >
            📄 Upload Documents
          </Link>
          
          <Link
            to="/chat"
            className="px-6 py-3 text-blue-700 border border-blue-600 bg-white rounded-xl font-semibold hover:bg-blue-50 transition duration-200 shadow-md hover:shadow-lg w-full sm:w-auto text-center"
          >
            🤖 Chat with AI
          </Link>

          <Link
            to="/quiz"
            className="px-6 py-3 text-white rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto text-center"
          >
             📝 Take Quiz
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md hover:shadow-lg transition duration-200">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">
              📁 Document Upload
            </h2>
            <p className="text-gray-700 text-sm">
              Upload your files securely and access them anytime with ease and speed.
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl shadow-md hover:shadow-lg transition duration-200">
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">
              💬 AI Chat Assistant
            </h2>
            <p className="text-gray-700 text-sm">
              Get instant help or answers from our smart and friendly AI-powered assistant.
            </p>
          </div>
                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl shadow-md hover:shadow-lg transition duration-200">
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">
              📝 General Knowledge Quiz
            </h2>
            <p className="text-gray-700 text-sm">
              Test your knowledge with our interactive quizzes. Learn and have fun at the same time!
            </p>
            </div>
        </div>
      </div>
    </div>
   </>
  );
}
