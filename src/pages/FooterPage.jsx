import React from "react";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";

const FooterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="sticky top-0 z-40">
        <PublicNavbar />
      </div>
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold text-slate-900">Footer</h1>
        <p className="mt-2 text-sm text-gray-600">
          Explore the site links and legal information in the footer below.
        </p>
      </main>
      <PublicFooter />
    </div>
  );
};

export default FooterPage;
