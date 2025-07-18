import { useState } from "react";
import { API, handleApi } from "../services/api";
import { useAuth } from "./../context/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LoaderCircle } from 'lucide-react'

export default function DocumentUpload({afterUpload}) {

  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const auth = useAuth();

  const handleUpload = async () => {
    if (files.length === 0) return toast("⚠️ Please select a file!");
    if (files.length > 5) return toast.error(" You can only upload up to 5 files at a time!");

    setLoading(true);

    const formData = new FormData();
    for (let file of files){
      formData.append("documents", file);
    }

    try{

      let res = await handleApi(API.post("/docs/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${auth.authToken}`,
        },
        withCredentials: true,
      }))
  
      if(res.status == 200) {
        toast.success(res.data.message);
        navigate(afterUpload);
      }
  
      if(res.error){
        console.error("Upload error:", res.error);
        toast.error(res.error.message);
      }
  
      setLoading(false);
      setFiles([]);

    }catch(err){
      console.log(err);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length > 5) {
        toast.error("You can upload up to 5 documents at a time.");
        setFiles([]);
      } else {
        setFiles(dropped);
      }
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl border border-gray-100">
      <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
        Upload Document
      </h2>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative mb-4 p-8 border-2 ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'
        } rounded-xl transition-all duration-200`}
      >
        <input
          type="file"
          accept=".pdf,.txt"
          multiple
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const selected = Array.from(e.target.files);
            if (selected.length > 5) {
              toast.error("You can upload up to 5 documents at a time.");
              setFiles([]);
            } else {
              setFiles(selected);
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop your files here, or click to select
          </p>
          {files.length !== 0 && (
            <p className="mt-2 text-sm text-gray-800">
              Selected file: { files.map(file => file.name).join(', ') }
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleUpload}
        disabled={loading || files.length === 0}
        className={`w-full py-2.5 px-4 rounded-xl font-semibold transition-all hover:cursor-pointer duration-200 ${
          loading
            ? 'bg-blue-300 cursor-not-allowed shadow-sm'
            : files.length === 0
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {loading ? 

          (<p className="flex justify-center items-center gap-2">
            <LoaderCircle className="animate-spin"/> <span>Uploading...</span> 
          </p>)
         : 
         ("Upload Document")}
      </button>
      
    </div>
  );
}