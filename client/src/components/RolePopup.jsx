import { useState } from "react";
import { GraduationCap } from "lucide-react";

export default function RolePopup({ onConfirm, onClose }) {
  const [role, setRole] = useState("");

  const handleSaveRole = (e) => {
    e.preventDefault();
    if (role) {
      onConfirm(role);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-400/40 via-blue-200/60 to-pink-200/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center relative border border-indigo-100">
        <button
          className="absolute top-3 right-4 text-gray-400 hover:text-indigo-600 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex flex-col items-center mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-4 mb-2 shadow-lg">
            <GraduationCap className="text-white w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-1">
            Are you Student or Educator?
          </h3>
          <p className="text-gray-500 text-sm mb-2">
            Select your role to personalize your SmartGlass experience.
          </p>
        </div>
        <form onSubmit={handleSaveRole}>
          <div className="mb-6">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-black font-semibold transition"
            >
              <option value="">-- Select Role --</option>
              <option value="Student">Student</option>
              <option value="Educator">Educator</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={!role}
            className={`w-full py-3 hover:cursor-pointer rounded-xl font-bold transition-all duration-200 shadow-lg
              ${role
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
}