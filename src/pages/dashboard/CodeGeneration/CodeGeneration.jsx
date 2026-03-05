import React, { useState } from "react";
import {
  FiCode,
  FiPlay,
  FiRefreshCw,
  FiEdit,
  FiBookOpen,
  FiSave,
} from "react-icons/fi";

const CodeGeneration = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const generateCode = () => {
    setLoading(true);

    setTimeout(() => {
      const fakeCode = `// Example Moving Average Strategy
//@version=5
strategy("MA Crossover", overlay=true)

fastMA = ta.sma(close, 9)
slowMA = ta.sma(close, 21)

if ta.crossover(fastMA, slowMA)
    strategy.entry("Buy", strategy.long)

if ta.crossunder(fastMA, slowMA)
    strategy.close("Buy")`;

      setGeneratedCode(fakeCode);
      setExplanation("");
      setLoading(false);
    }, 1200);
  };

  const debugCode = () => {
    setExplanation(
      "No syntax errors detected. Consider adding risk management (Stop Loss / Take Profit) for better performance."
    );
  };

  const explainCode = () => {
    setExplanation(
      "This strategy uses a 9-period moving average and 21-period moving average. When the fast MA crosses above the slow MA, it enters a buy trade. When it crosses below, it closes the trade."
    );
  };

  const modifyCode = () => {
    setGeneratedCode((prev) =>
      prev + "\n\n// Added Risk Management\nstrategy.exit('TP/SL', profit=50, loss=25)"
    );
  };

  const saveSession = () => {
    alert("Session saved successfully!");
  };

  return (
    <div className="flex flex-col h-full bg-black text-white p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-yellow-500">
            Code Generation
          </h1>
          <p className="text-sm text-white mt-1">
            Generate, debug, and optimize trading strategies
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            placeholder="Session title..."
            className="px-3 py-2 bg-black border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-yellow-600 w-64"
          />

          <button
            onClick={saveSession}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-black rounded-lg hover:bg-white hover:text-black transition"
          >
            <FiSave />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* INPUT SECTION */}
      <div className="bg-black border border-gray-800 rounded-lg p-5 mb-6">
        <h2 className="text-lg font-semibold text-yellow-500 mb-3">
          Strategy Prompt
        </h2>

        <textarea
          rows="4"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your trading strategy..."
          className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-yellow-600 text-sm"
        />

        <button
          onClick={generateCode}
          disabled={loading}
          className="mt-4 w-full px-4 py-3 bg-yellow-600 text-black rounded-lg hover:bg-white hover:text-black transition flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <FiRefreshCw className="animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <FiPlay />
              <span>Generate Code</span>
            </>
          )}
        </button>
      </div>

      {/* ACTION BUTTONS */}
      {generatedCode && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={debugCode}
            className="px-4 py-3 bg-yellow-600 text-black rounded-lg hover:bg-white hover:text-black transition"
          >
            Debug Code
          </button>

          <button
            onClick={modifyCode}
            className="px-4 py-3 bg-yellow-600 text-black rounded-lg hover:bg-white hover:text-black transition"
          >
            Modify Code
          </button>

          <button
            onClick={explainCode}
            className="px-4 py-3 bg-yellow-600 text-black rounded-lg hover:bg-white hover:text-black transition"
          >
            Explain Code
          </button>
        </div>
      )}

      {/* OUTPUT SECTION */}
      {generatedCode && (
        <div className="bg-black border border-gray-800 rounded-lg overflow-hidden mb-6">
          <div className="bg-black border-b border-gray-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-yellow-500">
              <FiCode />
              <span className="text-sm font-medium">
                Generated Code
              </span>
            </div>
          </div>

          <pre className="p-5 text-sm text-green-400 overflow-x-auto">
            <code>{generatedCode}</code>
          </pre>
        </div>
      )}

      {/* EXPLANATION */}
      {explanation && (
        <div className="bg-black border border-gray-800 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-yellow-500 mb-2">
            Explanation / Debug Info
          </h3>
          <p className="text-white text-sm">{explanation}</p>
        </div>
      )}
    </div>
  );
};

export default CodeGeneration;