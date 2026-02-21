import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const PublicNavbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40">
      <div className="w-full bg-amber-50 border-b border-amber-200 text-amber-800">
        <div className="max-w-6xl mx-auto px-6 py-2 text-center text-xs md:text-sm">
          For educational purposes only. Not financial advice.
        </div>
      </div>
      <header className="bg-white/70 backdrop-blur border-b border-indigo-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-lg font-extrabold text-indigo-700">
          ForexGPT
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
          <a href="#differentiators" className="hover:text-indigo-700">Why ForexGPT</a>
          <a href="#how-ai-helps" className="hover:text-indigo-700">How AI Helps</a>
          <a href="#how-to-use" className="hover:text-indigo-700">How To Use</a>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-700 font-medium hover:bg-indigo-50 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
          >
            Sign Up
          </Link>
        </div>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 rounded-lg hover:bg-indigo-50 transition"
        >
          {open ? <XMarkIcon className="h-6 w-6 text-gray-700" /> : <Bars3Icon className="h-6 w-6 text-gray-700" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="max-w-6xl mx-auto px-6 py-3 space-y-3">
            <a href="#differentiators" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-indigo-700">Why ForexGPT</a>
            <a href="#how-ai-helps" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-indigo-700">How AI Helps</a>
            <a href="#how-to-use" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-indigo-700">How To Use</a>
            <div className="flex items-center gap-3 pt-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-700 font-medium hover:bg-indigo-50 transition w-full text-center"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition w-full text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
    </div>
  );
};

export default PublicNavbar;
