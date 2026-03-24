import React from "react";

const SignalResultCard = ({ symbol, direction, confidence, rationale }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{symbol}</div>
        <div className={`text-sm font-medium ${direction === "BUY" ? "text-[#D4AF37]" : "text-red-600"}`}>{direction}</div>
      </div>
      <div className="mt-2 text-sm text-gray-600">{rationale}</div>
      <div className="mt-3">
        <div className="text-xs text-gray-500 mb-1">Confidence</div>
        <div className="w-full bg-gray-200 rounded h-2">
          <div className="bg-indigo-600 h-2 rounded" style={{ width: `${Math.round(confidence * 100)}%` }} />
        </div>
      </div>
    </div>
  );
};

export default SignalResultCard;
