import React from "react";

const TranscriptViewer = ({ content }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 whitespace-pre-wrap">
      <div className="font-semibold mb-2">Transcript</div>
      <div className="text-sm text-gray-700">{content || "No transcript loaded."}</div>
    </div>
  );
};

export default TranscriptViewer;
