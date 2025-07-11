import { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

export default function SessionCreationPopup({ sessionCode, onClose }) {
    const [copied, setCopied] = useState(false);
  
    const handleCopy = () => {
      navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      toast.success("Session code copied to clipboard!");
      onClose && onClose();
    };
  
    return (
      <div className="fixed inset-0 bg-slate-400/60 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full text-center space-y-4">
          <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-purple-700">🎉 Session Created!</h2>
              <X onClick={onClose} className="hover:cursor-pointer"/>
          </div>
          <p className="text-gray-700 font-semibold">Share this session code with participants <span className="block">( valid for 48 hours )</span> </p>
  
          <div className="bg-gray-100 py-2 px-4 rounded-md font-mono text-lg text-blue-600 border border-gray-300 select-all">
            {sessionCode}
          </div>
  
          <button
            onClick={handleCopy}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
          >
            {copied ? "Copied!" : "Copy Code"}
          </button>
  
        </div>
      </div>
    );
  }
  