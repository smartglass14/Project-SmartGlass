import { useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required.";
    if (!form.password) newErrors.password = "Password is required.";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    const fieldErrors = validate();
    setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    setErrors(formErrors);
    if (Object.keys(formErrors).length === 0) {
      toast.success("Logged in successfully!");
      console.log("Logged in with:", form);
      setForm({ email: "", password: "" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-8">
      <img
        src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        alt="Login Visual"
        className="rounded-full w-40 h-40 object-cover mb-4 shadow-lg"
      />
      <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-2">
        Welcome Back
      </h1>
      <p className="text-gray-600 mb-6 text-center text-sm sm:text-base max-w-md">
        Log in to continue creating interactive SmartGlass sessions — your AI-powered classroom assistant.
      </p>
      <div className="bg-gray-50 shadow-md border border-gray-200 rounded-2xl px-8 pt-6 pb-8 w-full max-w-md animate-fade-in">
        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input
            className="w-full mb-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            name="email"
            placeholder="your@email.com"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-red-500 text-xs mb-2">{errors.email}</p>}

          <label className="block text-sm text-gray-700 mt-3 mb-1">Password</label>
          <input
            className="w-full mb-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            name="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
          />
          {errors.password && <p className="text-red-500 text-xs mb-4">{errors.password}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2 rounded-md transition duration-300 disabled:opacity-50"
            disabled={!form.email || !form.password}
          >
            Login
          </button>

          <p className="text-center text-sm mt-4 text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 underline">
              Sign up here
            </Link>
          </p>

          <p className="text-center text-sm mt-2">
            <Link to="/reset-password" className="text-blue-500 underline">
              Forgot Password?
            </Link>
          </p>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}

export default Login;

