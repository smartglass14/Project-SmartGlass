import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-gray-100 flex flex-col items-center">
        <svg
          className="w-24 h-24 text-blue-500 mb-6 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 48 48"
        >
          <circle cx="24" cy="24" r="22" strokeWidth="4" stroke="currentColor" fill="#e0e7ff" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            d="M16 30c2.5-2 7.5-2 10 0M18 20h.01M30 20h.01"
            stroke="currentColor"
          />
        </svg>
        <h1 className="text-5xl font-extrabold text-blue-700 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8 text-center max-w-xs">
          Oops! The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}