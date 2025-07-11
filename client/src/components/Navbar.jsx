import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {useAuth} from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const auth = useAuth();

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `relative px-4 py-2 rounded-xl transition-all duration-300 font-medium text-sm ${
      isActive(path)
        ? "bg-white/20 text-white backdrop-blur-sm border border-white/20 shadow-lg"
        : "text-white/80 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm"
    }`;

  const mobileLinkClass = (path) =>
    `block px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
      isActive(path)
        ? "bg-blue-500 text-white shadow-lg"
        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
    }`;

  const handleLogout = () => {
    auth.logOutUser();
    setIsMobileMenuOpen(false); 
    toast.success("User Logged Out!")
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 backdrop-blur-lg bg-opacity-90 sticky top-0 z-50 shadow-2xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 text-white hover:scale-105 transition-transform duration-300"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <span className="text-xl">🚀</span>
            </div>
            <span className="text-2xl font-bold text-white logo-font">
              SmartGlass
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-white/5 rounded-2xl p-1 backdrop-blur-sm border border-white/10">
              <Link to="/" className={linkClass("/")}>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </span>
              </Link>
              <Link to="/upload" className={linkClass("/upload")}>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload
                </span>
              </Link>
              <Link to="/chat" className={linkClass("/chatbot")}>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-4.97 0-9-3.582-9-8s4.03-8 9-8 9 3.582 9 8z"
                    />
                  </svg>
                  Chatbot
                </span>
              </Link>
              {auth?.user && (
              <Link to="/dashboard" className={linkClass("/dashboard")}>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-4.97 0-9-3.582-9-8s4.03-8 9-8 9 3.582 9 8z"
                    />
                  </svg>
                 📊 Dashboard
                </span>
              </Link>
              )}
            </div>

            {/* Login Button */}
            {!auth.isLoggedIn? 
            (<Link
              to="/login"
              className="ml-4 px-6 py-2 hover:cursor-pointer bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 hover:scale-105 transition-all duration-100 shadow-lg hover:shadow-xl"
            >
              Login
            </Link>) :

            (<button className="ml-4 px-6 py-2 hover:cursor-pointer bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 hover:scale-105 transition-all duration-100 shadow-lg hover:shadow-xl"
              onClick={handleLogout}
            >
              Logout 
            </button>)

            }

          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-80 opacity-100 pb-4 mb-3" : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="bg-white rounded-2xl mt-4 p-4 shadow-xl border border-gray-100">
            <div className="space-y-2">
              <Link
                to="/"
                className={mobileLinkClass("/")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </span>
              </Link>
              <Link
                to="/upload"
                className={mobileLinkClass("/upload")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload
                </span>
              </Link>
              <Link
                to="/chat"
                className={mobileLinkClass("/chatbot")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-4.97 0-9-3.582-9-8s4.03-8 9-8 9 3.582 9 8z"
                    />
                  </svg>
                  Chatbot
                </span>
              </Link>
              {auth?.user && (
               <Link
                to="/dashboard"
                className={mobileLinkClass("/dashboard")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                 📊 Dashboard
                </span>
              </Link>
              )}
              <div className="pt-2 border-t border-gray-200">

                {!auth.isLoggedIn ?
                (<Link
                  to="/login"
                  className="block w-full px-4 py-3 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>) :
                (<button
                  className="block w-full px-4 py-3 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                  onClick={handleLogout}
                >
                  Logout
                </button>)
                } 
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
