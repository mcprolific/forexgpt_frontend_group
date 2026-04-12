import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white px-6 py-10">
      <div className="max-w-2xl text-center border border-white/10 rounded-3xl bg-white/5 p-10 shadow-2xl backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.32em] text-yellow-400 mb-4">Page not found</p>
        <h1 className="text-5xl font-black mb-6">404</h1>
        <p className="text-base text-white/70 leading-relaxed mb-8">
          The page you are looking for does not exist or has been moved. Check the URL or return to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-yellow-500 text-black font-semibold transition hover:bg-yellow-400"
          >
            Go to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl border border-white/10 text-white transition hover:bg-white/5"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
