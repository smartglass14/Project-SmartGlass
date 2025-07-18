import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAllChats, initiateNewChat } from "../../services/chatAPI";
import MyDocs from "../../components/MyDocs";
import { X, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function ChatListPage() {
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDocs, setOpenDocs] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if(!auth && !auth?.isLoggedin){
      toast.error("You need to login to access this page");
      return navigate('/login');
    }
    (async () => {
      const chats = await getAllChats();
      setConversations(chats);
    })();
  }, [auth, navigate]);

  const handleOpenDocs = () => setSidebarOpen(false) || setOpenDocs(true);

  const handleDocSelect = async (doc) => {
    if (!doc) return;
    const newChat = await initiateNewChat({ title: doc.fileName || "New Chat", documentIds: [doc.fileId] });
    if (newChat) {
      navigate(`/chat/${newChat._id}`);
    }
  };


  const filteredConversations = conversations.filter(c => (c.title || "").toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      {openDocs && <MyDocs onClose={() => setOpenDocs(false)} onSelect={handleDocSelect} />}
      <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-800 text-gray-100">
        {/* Sidebar */}
        <aside className={`fixed z-30 inset-y-0 left-0 bg-[#181c23] border-r border-gray-800 w-72 max-w-full flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:w-72`}>
          <div className="flex items-center max-sm:justify-between justify-center px-4 py-4 border-b border-gray-800">
            <span className="text-lg font-semibold text-indigo-400 ">Recent Conversations</span>
            <button className="md:hidden p-2" onClick={() => setSidebarOpen(false)}>
              <X />
            </button>
          </div>
          <button
            onClick={handleOpenDocs}
            className="m-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold shadow hover:from-indigo-700 hover:to-blue-700 transition"
          >
            + New Chat
          </button>
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
                  className={`group flex items-center px-3 py-2 rounded-lg mb-1 cursor-pointer transition-colors text-sm font-medium truncate hover:bg-gray-800 text-gray-200`}
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
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          setRenamingId(null);
                        } else if (e.key === 'Escape') {
                          setRenamingId(null);
                        }
                      }}
                    />
                  ) : (
                    <span className="flex-1 truncate p-2">{conversation.title}</span>
                  )}
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
        {/* Main area */}
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
              <span className="text-2xl logo-font font-bold text-indigo-200 tracking-tight">SmartGlass AI</span>
            </div>
            <Link className="text-lg font-semibold text-indigo-300 hover:underline" to="/dashboard">Home</Link>
          </header>
          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-2xl text-indigo-200 font-bold mb-2">👋 Hello! How can I help you today?</div>
            <div className="text-gray-400">Start a new chat or select a conversation from the sidebar.</div>
          </div>
        </main>
      </div>
    </>
  );
} 