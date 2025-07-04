import { useState, useEffect, useRef } from "react";
import { sendMessageToBot } from "../services/api";

export default function Chatbot() {
 const [messages, setMessages] = useState([
 { sender: "bot", text: "👋 Hello! Ask me anything.", timestamp: new Date(), error: false }
 ]);
 const [input, setInput] = useState("");
 const [isTyping, setIsTyping] = useState(false);
 const [lastFailed, setLastFailed] = useState(null); // index of last failed message
 const [conversations, setConversations] = useState([]);
 const [currentConversationId, setCurrentConversationId] = useState(null);
 const [showHistory, setShowHistory] = useState(false);
 const [searchTerm, setSearchTerm] = useState("");
 const inputRef = useRef(null);
 const messagesEndRef = useRef(null);
 const [renamingId, setRenamingId] = useState(null);
 const [renameValue, setRenameValue] = useState("");
 const chatAreaRef = useRef(null);
 const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
 const [selectedNav, setSelectedNav] = useState('Home');

 // Load conversations from localStorage on component mount
 useEffect(() => {
 const savedConversations = localStorage.getItem('chatbot_conversations');
 if (savedConversations) {
 const parsed = JSON.parse(savedConversations);
 setConversations(parsed);
 // Auto-load the most recent conversation if available
 if (parsed.length > 0) {
 setCurrentConversationId(parsed[0].id);
 setMessages(parsed[0].messages);
 }
 }
 }, []);

 // Save conversations to localStorage whenever they change
 useEffect(() => {
 localStorage.setItem('chatbot_conversations', JSON.stringify(conversations));
 }, [conversations]);

 const createNewConversation = () => {
 const newId = Date.now().toString();
 const newConversation = {
 id: newId,
 title: "New Chat",
 messages: [{ sender: "bot", text: "👋 Hello! Ask me anything.", timestamp: new Date(), error: false }],
 createdAt: new Date()
 };
 setConversations(prev => [newConversation, ...prev]);
 setCurrentConversationId(newId);
 setMessages(newConversation.messages);
 };

 const scrollToBottom = () => {
   setTimeout(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, 100);
 };

 const loadConversation = (conversationId) => {
 const conversation = conversations.find(c => c.id === conversationId);
 if (conversation) {
 setMessages(conversation.messages);
 setCurrentConversationId(conversationId);
 setTimeout(scrollToBottom, 0);
 }
 };

 const deleteConversation = (conversationId) => {
 setConversations(prev => prev.filter(c => c.id !== conversationId));
 if (currentConversationId === conversationId) {
 createNewConversation();
 setTimeout(scrollToBottom, 0);
 }
 };

 const updateConversationTitle = (conversationId, title) => {
 setConversations(prev => prev.map(c => 
 c.id === conversationId ? { ...c, title } : c
 ));
 };

 const sendMessage = async (retryIdx = null) => {
 let userMessage = input;
 let updatedMessages = messages;
 let retrying = false;

 // If no currentConversationId or conversation is missing, create a new one
 if (!currentConversationId || !conversations.find(c => c.id === currentConversationId)) {
   const newId = Date.now().toString();
   const newConversation = {
     id: newId,
     title: "New Chat",
     messages: messages,
     createdAt: new Date()
   };
   setConversations(prev => [newConversation, ...prev]);
   setCurrentConversationId(newId);
 }

 if (retryIdx !== null) {
   // Retry logic
   userMessage = messages[retryIdx].text;
   updatedMessages = messages.slice(0, retryIdx + 1);
   setMessages(updatedMessages);
   setLastFailed(null);
   retrying = true;
 } else {
   if (!input.trim()) return;
   updatedMessages = [
     ...messages,
     { sender: "user", text: input, timestamp: new Date(), error: false }
   ];
   setMessages(updatedMessages);
   setInput("");
 }
 setIsTyping(true);
 inputRef.current?.focus();
 try {
   const res = await sendMessageToBot(userMessage);
   const botReply = res?.data?.reply || "🤖 I'm not sure how to respond.";
   const finalMessages = [
     ...updatedMessages,
     { sender: "bot", text: botReply, timestamp: new Date(), error: false }
   ];
   setTimeout(() => {
     setMessages(finalMessages);
     setIsTyping(false);
     // Update conversation in history
     if (currentConversationId) {
       setConversations(prev => prev.map(c =>
         c.id === currentConversationId
           ? { ...c, messages: finalMessages, title: c.title === "New Chat" ? userMessage.slice(0, 30) + "..." : c.title }
           : c
       ));
     }
   }, 800);
 } catch {
   setTimeout(() => {
     const errorMessages = [
       ...updatedMessages,
       { sender: "bot", text: "❌ Error: Failed to get response.", timestamp: new Date(), error: true }
     ];
     setMessages(errorMessages);
     setIsTyping(false);
     setLastFailed(updatedMessages.length - 1);
     // Update conversation in history
     if (currentConversationId) {
       setConversations(prev => prev.map(c =>
         c.id === currentConversationId
           ? { ...c, messages: errorMessages }
           : c
       ));
     }
   }, 800);
 }

 // In sendMessage, if this is the first user message in a new chat, update the chat title and ensure the conversation is saved
 if (currentConversationId && updatedMessages.length === 2 && updatedMessages[0].sender === "bot" && updatedMessages[1].sender === "user") {
   setConversations(prev => prev.map(c =>
     c.id === currentConversationId
       ? { ...c, title: userMessage.slice(0, 30) || "New Chat", messages: updatedMessages }
       : c
   ));
 }
 };

 const handleKeyDown = (e) => {
 if (e.key === "Enter") sendMessage();
 };

 // Helper to check if user is near the bottom
 function isUserNearBottom() {
   const el = chatAreaRef.current;
   if (!el) return true;
   return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
 }

 useEffect(() => {
   // Only scroll if a new message is added and user is near the bottom
   if (isUserNearBottom()) {
     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }
   // eslint-disable-next-line
 }, [messages, isTyping]);

 useEffect(() => {
 inputRef.current?.focus();
 }, []);

 const handleClear = () => {
 createNewConversation();
 };

 const filteredConversations = conversations.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

 return (
   <div className="flex h-[600px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
     {/* Chat History Sidebar */}
     <div className={`transition-all duration-300 h-full z-10 ${sidebarCollapsed ? 'w-16' : 'w-80'} bg-gray-900 text-white relative flex flex-col`}>
       {/* Collapse/Expand Button */}
       {sidebarCollapsed ? (
         <button
           className="absolute top-4 left-1/2 -translate-x-1/2 z-20 p-2 rounded-lg hover:bg-gray-800 transition-colors"
           onClick={() => setSidebarCollapsed(false)}
           aria-label="Open sidebar"
         >
           {/* Heroicons Bars-3 (Hamburger) */}
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
           </svg>
         </button>
       ) : (
         <button
           className="absolute top-4 right-4 z-20 p-2 rounded-lg hover:bg-gray-800 transition-colors"
           onClick={() => setSidebarCollapsed(true)}
           aria-label="Close sidebar"
         >
           {/* Heroicons Chevron-Left */}
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
           </svg>
         </button>
       )}
       {/* Sidebar content */}
       <div className={`flex-1 flex flex-col h-full ${sidebarCollapsed ? 'items-center justify-start pt-16' : ''}`}>
         {/* New chat button */}
         <button
           onClick={createNewConversation}
           className={`flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-gray-800 transition-colors text-base font-medium mt-4 ${sidebarCollapsed ? 'justify-center w-10 h-10 p-0' : ''}`}
           aria-label="New chat"
           title="New chat"
         >
           {/* Heroicons Plus (Outline) */}
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
           </svg>
           {!sidebarCollapsed && 'New chat'}
         </button>
         {/* Search chats */}
         {!sidebarCollapsed && (
           <div className="w-full relative">
             <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
               {/* Heroicons Magnifying Glass */}
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6z" />
               </svg>
             </span>
             <input
               type="text"
               placeholder="Search chats"
               className="pl-10 pr-3 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2 mt-2 w-full"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               aria-label="Search chats"
               title="Search chats"
             />
           </div>
         )}
         {/* Chats heading below search */}
         {!sidebarCollapsed && (
           <span className="font-semibold text-lg mt-2 mb-1 text-gray-400 px-4">Chats</span>
         )}
         {/* Scrollable chat list with search filter */}
         <div className={`flex-1 overflow-y-auto px-2 pb-2 w-full ${sidebarCollapsed ? 'hidden' : ''}`} style={{ minHeight: 0 }}>
           <style>{`
             .custom-scrollbar::-webkit-scrollbar {
               width: 8px;
               background: #1a202c;
             }
             .custom-scrollbar::-webkit-scrollbar-thumb {
               background: #374151;
               border-radius: 4px;
             }
             .custom-scrollbar {
               scrollbar-width: thin;
               scrollbar-color: #374151 #1a202c;
             }
           `}</style>
           <div className="custom-scrollbar" style={{ maxHeight: '100%', overflowY: 'auto' }}>
             {filteredConversations.length === 0 ? (
               <div className="text-center text-gray-400 py-8">
                 <p>No conversations yet</p>
                 <p className="text-sm">Start a new chat to begin!</p>
               </div>
             ) : (
               filteredConversations.map((conversation) => (
                 <div
                   key={conversation.id}
                   className={`group flex items-center px-4 py-2 rounded-lg mb-1 cursor-pointer transition-colors text-sm font-medium truncate ${
                     currentConversationId === conversation.id
                       ? 'bg-gray-800 text-white'
                       : 'hover:bg-gray-800 text-gray-200'
                   }`}
                   onClick={() => loadConversation(conversation.id)}
                   title={conversation.title}
                 >
                   {renamingId === conversation.id ? (
                     <input
                       className="flex-1 bg-gray-700 text-white rounded px-2 py-1 mr-2 focus:outline-none"
                       value={renameValue}
                       autoFocus
                       onChange={e => setRenameValue(e.target.value)}
                       onBlur={() => {
                         setRenamingId(null);
                         if (renameValue.trim()) {
                           setConversations(prev => prev.map(c => c.id === conversation.id ? { ...c, title: renameValue.trim() } : c));
                         }
                         scrollToBottom();
                       }}
                       onKeyDown={e => {
                         if (e.key === 'Enter') {
                           setRenamingId(null);
                           if (renameValue.trim()) {
                             setConversations(prev => prev.map(c => c.id === conversation.id ? { ...c, title: renameValue.trim() } : c));
                           }
                           scrollToBottom();
                         } else if (e.key === 'Escape') {
                           setRenamingId(null);
                         }
                       }}
                     />
                   ) : (
                     <span className="flex-1 truncate" style={{ pointerEvents: 'none' }}>{conversation.title}</span>
                   )}
                   {/* Inline Rename and Delete icons, only show on hover/focus */}
                   <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                     <button
                       className="p-1 text-gray-400 hover:text-blue-400"
                       aria-label="Rename chat"
                       title="Rename"
                       onClick={() => {
                         setRenamingId(conversation.id);
                         setRenameValue(conversation.title);
                       }}
                       tabIndex={0}
                     >
                       {/* Heroicons Pencil Square (Outline) */}
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L7.5 19.213l-4 1 1-4L16.862 3.487z" />
                       </svg>
                     </button>
                     <button
                       className="p-1 text-gray-400 hover:text-red-400"
                       aria-label="Delete chat"
                       title="Delete"
                       onClick={() => deleteConversation(conversation.id)}
                       tabIndex={0}
                     >
                       {/* Heroicons Trash (Outline) */}
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12z" />
                       </svg>
                     </button>
                   </div>
                 </div>
               ))
             )}
           </div>
         </div>
       </div>
     </div>
     {/* Main Chat Area */}
     <div className="flex-1 flex flex-col">
       {/* Header */}
       <div className="p-4 border-b border-gray-200 bg-white">
         <div className="flex items-center gap-3">
           <button
             onClick={() => setShowHistory(!showHistory)}
             className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
             aria-label="Toggle chat history"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
             </svg>
           </button>
           <h2 className="text-xl font-semibold text-gray-800">AI Chatbot</h2>
         </div>
       </div>
       {/* Messages */}
       <div ref={chatAreaRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
         {messages.map((msg, idx) => (
           <div
             key={idx}
             className={`max-w-xs px-4 py-2 rounded-xl text-sm relative group ${
               msg.sender === "user"
                 ? "ml-auto"
                 : msg.error
                 ? "bg-red-100 text-red-700 border border-red-300 shadow rounded-bl-none"
                 : "bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-100"
             }`}
             style={msg.sender === "user" ? { backgroundColor: '#eaf4ff', color: '#1e293b' } : {}}
             aria-label={msg.sender === "user" ? "User message" : msg.error ? "Error message" : "Bot message"}
           >
             <span>{msg.text}</span>
             <span className="block text-[10px] text-gray-400 mt-1 text-right">
               {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
             {msg.error && (
               <button
                 className="absolute right-2 top-2 text-xs text-red-600 underline opacity-80 group-hover:opacity-100 focus:outline-none"
                 onClick={() => sendMessage(idx)}
                 aria-label="Retry message"
               >
                 Retry
               </button>
             )}
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
       {/* Input */}
       <div className="p-4 border-t border-gray-200 bg-white">
         <form className="flex gap-2 items-center bg-white rounded-xl shadow-inner px-3 py-2 border border-gray-400" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
           <input
             type="text"
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={handleKeyDown}
             placeholder="Type your message..."
             className="flex-1 bg-transparent px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-xl disabled:opacity-60"
             ref={inputRef}
             aria-label="Message input"
             disabled={isTyping}
             autoComplete="off"
           />
           <button
             type="submit"
             disabled={isTyping || !input.trim()}
             className={`flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl shadow-md transition-all duration-200 hover:from-indigo-700 hover:to-blue-700 focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed`}
             aria-label="Send message"
           >
             {/* Paper plane send icon, modern style */}
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.5l18-7-7 18-2.5-7L3 10.5z" />
             </svg>
           </button>
         </form>
       </div>
     </div>
   </div>
 );
}
