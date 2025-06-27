import Chatbot from "../components/Chatbot";

export default function ChatbotPage() {
 return (
 <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 pt-16">
    <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-4xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">
            Chat with Our AI Assistant
        </h1>
        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-6 sm:p-10 border border-gray-100">
            <Chatbot />
        </div>
        <p className="text-center text-gray-600 mt-4 text-sm">
            Get instant support and answers from our AI-powered chatbot
        </p>
    </div>
 </div>
 );
}
