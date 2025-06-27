import { useState, useEffect, useRef } from "react";
import { sendMessageToBot } from "../services/api";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hello! Ask me anything." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages, { sender: "user", text: input }];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await sendMessageToBot(input);
      const botReply = res?.data?.reply || "🤖 I'm not sure how to respond.";
      setTimeout(() => {
        setMessages([...updatedMessages, { sender: "bot", text: botReply }]);
        setIsTyping(false);
      }, 800); // Simulate typing delay
    } catch {
      setTimeout(() => {
        setMessages([...updatedMessages, { sender: "bot", text: "❌ Error: Failed to get response." }]);
        setIsTyping(false);
      }, 800);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6">
        AI Chatbot
      </h2>

      <div className="h-80 overflow-y-auto bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-xs px-4 py-2 rounded-xl text-sm ${
              msg.sender === "user"
                ? "ml-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg rounded-br-none"
                : "bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-100"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="max-w-xs px-4 py-2 rounded-xl text-sm bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-100">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-shadow duration-200 shadow-sm"
        />
        <button
          onClick={sendMessage}
          disabled={isTyping}
          className={`px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg ${
            isTyping ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
}