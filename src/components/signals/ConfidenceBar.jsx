import React from "react";

const ConfidenceBar = ({ value = 0 }) => {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div className="w-full bg-gray-200 rounded h-2">
      <div className="bg-green-600 h-2 rounded" style={{ width: `${pct}%` }} />
    </div>
  );
};

export default ConfidenceBar;
