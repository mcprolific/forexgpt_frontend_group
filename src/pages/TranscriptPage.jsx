import React, { useState } from "react";
import TranscriptUploader from "../components/transcript/TranscriptUploader";
import TranscriptViewer from "../components/transcript/TranscriptViewer";
import useToast from "../hooks/useToast";

const TranscriptPage = () => {
  const [content, setContent] = useState("");
  const { toast, show } = useToast();

  const handleUpload = async (file) => {
    const ext = file.name.toLowerCase().split(".").pop();
    if (ext === "txt" || ext === "md") {
      const text = await file.text();
      setContent(text);
      show("Transcript loaded", "success");
    } else {
      show("Only .txt or .md supported for preview", "warning");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Transcript</h1>
      <p className="text-sm text-gray-600">Upload and view transcripts for signal analysis.</p>

      {toast && (
        <div
          className={`text-sm px-3 py-2 rounded border ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : toast.type === "warning"
              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      <TranscriptUploader onUpload={handleUpload} />
      <TranscriptViewer content={content} />
    </div>
  );
};

export default TranscriptPage;
