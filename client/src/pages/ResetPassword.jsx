import { useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (value) => {
    if (!value) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Enter a valid email address.";
    return "";
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError(validateEmail(value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateEmail(email);
    setError(validation);
    if (!validation) {
      toast.success("Reset link sent to your email!");
      console.log("Reset email sent to:", email);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-8">
      <img
        src="https://cdn-icons-png.flaticon.com/512/2919/2919600.png"
        alt="Reset Password"
        className="rounded-full w-40 h-40 object-cover mb-4 shadow-md"
      />
      <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-2">
        Reset Your Password
      </h1>
      <p className="text-gray-600 mb-6 text-center text-sm sm:text-base max-w-md">
        Enter your email address to receive a password reset link.
      </p>
      <div className="bg-gray-50 shadow-md border border-gray-200 rounded-2xl px-8 pt-6 pb-8 w-full max-w-md animate-fade-in">
        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input
            className="w-full mb-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={handleChange}
          />
          {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2 rounded-md transition duration-300 disabled:opacity-50"
            disabled={!email || error}
          >
            Send Reset Link
          </button>

          <p className="text-center text-sm mt-4 text-gray-600">
            Remembered your password?{' '}
            <Link to="/login" className="text-indigo-600 underline">
              Go to Login
            </Link>
          </p>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}

export default ResetPassword;
