import { useState } from "react";
import { uploadFile } from "../services/api";

export default function DocumentUpload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async () => {
    if (!file) return setStatus("⚠️ Please select a file.");

    setLoading(true);
    setStatus("");

    try {
      await uploadFile(file);
      setStatus("✅ File uploaded successfully!");
      setFile(null);
    } catch {
      setStatus("❌ Upload failed. Please try again.");
    } finally {
      setLoading(false);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="p-8 mt-10 max-w-xl mx-auto bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl border border-gray-100">
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
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => setFile(e.target.files[0])}
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
            Drag and drop your file here, or click to select
          </p>
          {file && (
            <p className="mt-2 text-sm text-gray-800">
              Selected file: {file.name}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className={`w-full py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 ${
          loading
            ? 'bg-blue-300 cursor-not-allowed shadow-sm'
            : !file
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {loading ? "Uploading..." : "Upload Document"}
      </button>

      {status && (
        <p className={`mt-4 text-center text-sm ${status.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
          {status}
        </p>
      )}
    </div>
  );
}