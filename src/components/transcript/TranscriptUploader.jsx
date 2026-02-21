import React from "react";

const TranscriptUploader = ({ onUpload }) => {
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="font-semibold mb-2">Upload Transcript</div>
      <input type="file" accept=".txt,.pdf,.md" onChange={handleChange} />
    </div>
  );
};

export default TranscriptUploader;
