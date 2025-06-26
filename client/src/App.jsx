import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} /> {/* ✅ Add this */}

    </Routes>
  );
}

export default App;



