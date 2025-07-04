import Chatbot from "../components/Chatbot";

export default function ChatbotPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            AI Chat Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience intelligent conversations with our AI-powered chatbot. 
            Your chat history is automatically saved, so you can continue conversations anytime.
          </p>
        </div>
        {/* Chatbot Component */}
        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-6 border border-gray-100">
          <Chatbot />
        </div>
        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Your conversations are stored locally in your browser for privacy and convenience.</p>
        </div>
      </div>
    </div>
  );
}
