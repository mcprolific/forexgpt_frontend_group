import React from "react";

const ReasoningPanel = ({ points = [] }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="font-semibold mb-2">AI Reasoning</div>
      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
        {points.length ? points.map((p, i) => <li key={i}>{p}</li>) : <li>No reasoning provided.</li>}
      </ul>
    </div>
  );
};

export default ReasoningPanel;
