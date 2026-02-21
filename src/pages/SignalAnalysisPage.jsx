import React, { useMemo, useState } from "react";
import ConfidenceBar from "../components/signals/ConfidenceBar";
import ReasoningPanel from "../components/signals/ReasoningPanel";
import SignalResultCard from "../components/signals/SignalResultCard";
import useDebounce from "../hooks/useDebounce";

const SignalAnalysisPage = () => {
  const [symbol, setSymbol] = useState("EURUSD");
  const [text, setText] = useState("");
  const debounced = useDebounce(text, 400);

  const direction = useMemo(() => {
    const l = debounced.toLowerCase();
    if (/sell|bear|down/.test(l)) return "SELL";
    if (/buy|bull|up/.test(l)) return "BUY";
    return "BUY";
  }, [debounced]);

  const confidence = useMemo(() => {
    const len = Math.min(100, debounced.length);
    return Math.max(0.3, len / 100); // 0.3–1
  }, [debounced]);

  const points = useMemo(() => {
    const out = [];
    if (debounced.includes("trend")) out.push("Detected trend keyword in transcript.");
    if (debounced.includes("support")) out.push("Support level referenced.");
    if (debounced.includes("resistance")) out.push("Resistance level referenced.");
    if (!out.length) out.push("No explicit pattern keywords detected; using default heuristics.");
    return out;
  }, [debounced]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Signal Analysis</h1>
      <p className="text-sm text-gray-600">Analyze signals with AI reasoning and history.</p>

      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="border rounded px-3 py-2"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Symbol e.g. EURUSD"
          />
          <input
            className="border rounded px-3 py-2 md:col-span-2"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a short transcript snippet"
          />
        </div>
        <ConfidenceBar value={confidence} />
      </div>

      <SignalResultCard
        symbol={symbol}
        direction={direction}
        confidence={confidence}
        rationale={`Signal inferred from text analysis (${direction}).`}
      />
      <ReasoningPanel points={points} />
    </div>
  );
};

export default SignalAnalysisPage;
