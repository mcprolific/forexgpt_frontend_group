import React from "react";
import { useNavigate } from "react-router-dom";

const SignalResultCard = ({ symbol, direction, confidence, rationale, signalDetected = true }) => {
  const navigate = useNavigate();
  const confidencePct = confidence != null ? Math.round(confidence * 100) : null;

  const handleLearnAboutSignal = () => {
    navigate("/dashboard/mentor/messages/new", {
      state: {
        fromSignals: true,
        prefilledQuestion: `Explain why ${rationale || "this signal was detected"}. How does this affect ${symbol}?`
      }
    });
  };

  const handleGenerateStrategy = () => {
    const confText = confidencePct != null ? `${confidencePct}%` : "a suitable threshold";
    navigate("/dashboard/codegen/session/new", {
      state: {
        fromSignals: true,
        prefilledDescription: `Create a strategy that trades ${symbol} ${direction} when similar forex exposure signals appear. Use confidence threshold of ${confText}.`
      }
    });
  };

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

      {signalDetected && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleLearnAboutSignal}
            className="px-3 py-2 rounded-md border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#D4AF37] hover:text-[#D4AF37] transition"
          >
            Learn About This Signal
          </button>
          <button
            onClick={handleGenerateStrategy}
            className="px-3 py-2 rounded-md bg-[#D4AF37] text-black text-xs font-semibold hover:brightness-110 transition"
          >
            Generate Strategy Based On This
          </button>
        </div>
      )}
    </div>
  );
};

export default SignalResultCard;
