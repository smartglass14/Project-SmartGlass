import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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
import Dashboard from "./pages/Dashboard";

function Layout({ children }) {
  const location = useLocation();
  const hideLayout = location.pathname === "/chat" || location.pathname.startsWith("/chat/");
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!hideLayout && <Navbar />}
      <Toaster position="top-center" />
      <main className="flex-grow">{children}</main>
      {!hideLayout && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/chat" element={<ChatbotPage />} />
            <Route path="/chat/:id" element={<ChatbotPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/dashboard" element={<Dashboard />} />

          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
