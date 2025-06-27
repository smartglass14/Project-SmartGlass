// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/LandingPage/Home";
import Upload from "./pages/UploadPage/Upload";
import ChatbotPage from "./pages/ChatbotPage";
import Login from "./pages/AuthPages/Login";
import Signup from "./pages/AuthPages/Signup";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import NotFound from './pages/NotFound.jsx';
import { Toaster } from "react-hot-toast"; 

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <Toaster position="top-right" /> 
        <main className="flex-grow pt-6 pb-12 px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} /> 
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />}/>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
