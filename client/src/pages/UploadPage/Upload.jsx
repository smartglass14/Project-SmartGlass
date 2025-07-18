import DocumentUpload from "../../components/DocumentUpload";
import { DocumentArrowUpIcon, CloudArrowUpIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";


export default function Upload() {
  
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [redirectTo,setRedirectTo] = useState("/dashboard");

  useEffect(() => {
    if (location?.state?.from) {
      setRedirectTo(location.state.from);
    }
  }, [location]);

  useEffect(()=> {
    if(!auth.loading && !auth.user && !auth.isLoggedIn) {
      navigate('/login');
      toast.error("You need to be sign in to uploading files.");
    }
  },[auth.user, auth.loading ,auth.isLoggedIn, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full">
                  <CloudArrowUpIcon className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              Upload Your Document
            </h1>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Drag and drop your files or browse to upload. We support multiple files upload 
              and ensure your documents are processed securely.
            </p>
          </div>

          {/* Main Upload Card */}
          <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 sm:p-12 border border-white/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
            <DocumentUpload afterUpload={redirectTo} />
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/30 hover:bg-white/80 transition-all duration-300 group">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Smart Processing</h3>
              </div>
              <p className="text-slate-600">
                AI-powered document analysis with automatic format detection and optimization.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/30 hover:bg-white/80 transition-all duration-300 group">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <DocumentArrowUpIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Multiple Files upload</h3>
              </div>
              <p className="text-slate-600">
                Support multiiple PDF files upload with drag-and-drop functionality.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/30 hover:bg-white/80 transition-all duration-300 group">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Secure Upload</h3>
              </div>
              <p className="text-slate-600">
                End-to-end encryption ensures your documents remain private and secure.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-lg rounded-full px-6 py-3 border border-white/30">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">Ready to accept uploads</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx={toString()}>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}
