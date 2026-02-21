import React from "react";
import { Link } from "react-router-dom";

const PublicFooter = ({ fixed = false }) => {
  const containerClass = fixed
    ? "fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur"
    : "border-t bg-white";

  return (
    <footer className={containerClass}>
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="text-lg font-extrabold text-indigo-700">ForexGPT</div>
          <p className="mt-2 text-sm text-gray-600">
            AI copilot for learning research, code generation, and backtesting concepts.
          </p>
          <p className="mt-2 text-xs text-amber-700">For educational purposes only. Not financial advice.</p>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">Education</div>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li><a href="#differentiators" className="hover:text-indigo-700">Why ForexGPT</a></li>
            <li><a href="#how-ai-helps" className="hover:text-indigo-700">How AI Helps</a></li>
            <li><a href="#how-to-use" className="hover:text-indigo-700">How To Use</a></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">Get Started</div>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li><Link to="/register" className="hover:text-indigo-700">Create account</Link></li>
            <li><Link to="/login" className="hover:text-indigo-700">Sign in</Link></li>
            <li><Link to="/dashboard" className="hover:text-indigo-700">Open dashboard</Link></li>
          </ul>
        </div>
      </div>
      {!fixed && (
        <div className="border-t">
          <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-gray-500 flex items-center justify-between">
            <span>© {new Date().getFullYear()} ForexGPT. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-indigo-700">Terms</a>
              <a href="#" className="hover:text-indigo-700">Privacy</a>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default PublicFooter;
