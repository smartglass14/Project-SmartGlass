import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAllChats, getChatById, chatWithAI, deleteChat, renameChat } from "../../services/chatAPI";
import { X, Trash2, Pencil, Menu, Clipboard } from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function ChatSessionPage() {
  const auth = useAuth();
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if(auth && !auth?.isLoggedIn){
      toast.error('You need to login to access this page');
      return navigate('/login')
    }
    (async () => {
      const chats = await getAllChats();
      setConversations(chats);
    })();
  }, [auth, navigate]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const chat = await getChatById(id);
      setMessages(chat?.messages || []);
    })();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleDeleteConversation = async (conversationId) => {
    const success = await deleteChat(conversationId);
    if (success) {
      setConversations(prev => prev.filter(c => c._id !== conversationId));
      if (id === conversationId) {
        navigate('/chat');
      }
    }
  };

  const sendMessage = async (retryIdx = null) => {
    let userMessage = input;
    if (!id) return;
    if (retryIdx !== null) {
      userMessage = messages[retryIdx].content;
    } else {
      if (!input.trim()) return;
      setMessages(prev => [
        ...prev,
        { role: "user", content: input, timestamp: new Date() }
      ]);
      setInput("");
    }
    setIsTyping(true);
    inputRef.current?.focus();
    try {
      const answer = await chatWithAI({ chatId: id, content: userMessage });
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: answer, timestamp: new Date() }
      ]);
    } catch (e) {
      console.log(e);
    }
    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const handleRename = async(chatId)=> {
    if(!chatId && renameValue === conversations.title){
      return;
    }
    await renameChat(chatId, renameValue);
    window.location.reload();
  }

  const copyToClipboard = (text)=> {
    navigator.clipboard.writeText(text);
    toast.success('Text copied')
  }

  const filteredConversations = conversations.filter(c => (c.title || "").toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-800 text-gray-100">
      {/* Sidebar */}
      <aside className={`fixed z-30 inset-y-0 left-0 bg-[#181c23] border-r border-gray-800 w-72 max-w-full flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:w-72`}>
        <div className="flex items-center max-sm:justify-between justify-center px-4 py-4 border-b border-gray-800">
          <span className="text-lg font-semibold text-indigo-400">Recent Conversations</span>
          <button className="md:hidden p-2" onClick={() => setSidebarOpen(false)}>
            <X />
          </button>
        </div>
        <div className="px-4">
          <input
            type="text"
            placeholder="Search chats"
            className="w-full px-3 py-2 mb-2 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No conversations yet</p>
              <p className="text-sm">Start a new chat to begin!</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                className={`group flex items-center px-3 py-2 rounded-lg mb-1 cursor-pointer transition-colors text-sm font-medium truncate ${
                  id === conversation._id
                    ? 'bg-gradient-to-r from-indigo-900 to-blue-900 text-indigo-200'
                    : 'hover:bg-gray-800 text-gray-200'
                }`}
                onClick={() => navigate(`/chat/${conversation._id}`)}
                title={conversation.title}
              >
                {renamingId === conversation._id ? (
                  <input
                    className="flex-1 bg-gray-800 text-gray-100 rounded px-2 py-1 mr-2 focus:outline-none"
                    value={renameValue}
                    autoFocus
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={() => {
                      setRenamingId(null);
                      handleRename(conversation._id);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        setRenamingId(null);
                        handleRename(conversation._id);
                      } else if (e.key === 'Escape') {
                        setRenamingId(null);
                      }
                    }}
                  />
                ) : (
                  <span className="flex-1 truncate">{conversation.title}</span>
                )}
                <div className="flex p-2 gap-2 ml-2 opacity-0 group-hover:opacity-100 max-sm:opacity-100 group-focus-within:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <button
                    className="text-blue-400"
                    aria-label="Rename chat"
                    title="Rename"
                    onClick={() => {
                      setRenamingId(conversation._id);
                      setRenameValue(conversation.title);
                    }}
                    tabIndex={0}
                  >
                    <Pencil size={"20px"} />
                  </button>
                  <button
                    className="text-red-400"
                    aria-label="Delete chat"
                    title="Delete"
                    onClick={() => handleDeleteConversation(conversation._id)}
                    tabIndex={0}
                  >
                    <Trash2 size={"20px"} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="text-xs text-gray-600 text-center py-2 border-t border-gray-800">SmartGlass &copy; {new Date().getFullYear()}</div>
      </aside>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <header className="w-full sticky top-0 z-10 bg-[#181c23]/90 backdrop-blur border-b border-gray-800 flex justify-between items-center px-4 py-3 shadow-sm">
          <div className="flex items-center">
            <button
              className="md:hidden mr-3 p-2 rounded hover:bg-gray-800"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu />
            </button>
            <Link className="text-2xl logo-font font-bold text-indigo-200 tracking-tight" to={"/chat"}> SmartGlass AI </Link>
          </div>
          <Link className="text-lg font-semibold text-indigo-300 hover:underline" to="/dashboard">Home</Link>
        </header>
        {/* Messages */}
        <section className="flex-1 overflow-y-auto px-0 sm:px-3 py-6 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-800">
          <div className="max-w-3xl mx-auto max-sm:mx-2 flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-[#23272f] text-indigo-100 border border-gray-800 shadow rounded-bl-none max-w-[70%]">
                  👋 Hello! How can i help you today?
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <>
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative px-4 py-3 rounded-2xl shadow transition-all max-w-[80%] sm:max-w-[70%] text-base break-words ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-br-none"
                        : "bg-[#23272f] text-indigo-100 border border-gray-800 rounded-bl-none"
                    } group`}
                  >
                    {msg.content}
                    <span className="block text-[10px] text-gray-400 mt-1 text-right">
                      {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      className="absolute right-15 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                      title="Copy message"
                      type="button"
                      onClick={() => copyToClipboard(msg.content)}
                    >
                      <Clipboard size={16} className="text-gray-400 hover:text-indigo-400" />
                    </button>
                  </div>
                </div>
                </>
              ))
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-[#23272f] text-indigo-100 border border-gray-800 shadow rounded-bl-none max-w-[70%]">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </section>
        {/* Input */}
        <footer className="sticky bottom-0 bg-[#181c23]/95 backdrop-blur border-t border-gray-800 px-4 py-4">
          <form
            className="flex gap-2 max-w-2xl mx-auto justify-center items-center"
            onSubmit={e => { e.preventDefault(); sendMessage(); }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the question..."
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-[#23272f] text-indigo-100 shadow"
              ref={inputRef}
              aria-label="Message input"
              disabled={isTyping}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-700 to-blue-700 text-white rounded-2xl font-bold shadow hover:from-indigo-800 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.5l18-7-7 18-2.5-7L3 10.5z" />
              </svg>
            </button>
          </form>
        </footer>
      </main>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          background: #23272f;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #23272f;
          border-radius: 4px;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #23272f #181c23;
        }
      `}</style>
    </div>
  );
} 