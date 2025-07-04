import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/LandingPage/Home";
import Upload from "./pages/UploadPage/Upload";
import ChatbotPage from "./pages/ChatbotPage";
import Login from "./pages/AuthPages/Login";
import QuizPage from "./pages/QuizPage";
import Signup from "./pages/AuthPages/Signup";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import NotFound from './pages/NotFound.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <Toaster position="top-center" /> 
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/login" element={<Login />} />
              <Route path= "/quiz" element={ <QuizPage /> }/>
              <Route path="/signup" element={<Signup />} /> 
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />}/>
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
