import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Toast from "../../ui/Toast";
import useToast from "../../../hooks/useToast";

const GOLD = "#D4AF37";
const CHARCOAL = "#1A1A1A";

const DashboardLayout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { toast, show } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const flash = location.state?.toast;
    if (!flash?.message) return;

    show(flash.message, flash.type || "info", flash.duration || 4500);

    const nextState = { ...(location.state || {}) };
    delete nextState.toast;

    navigate(location.pathname, {
      replace: true,
      state: Object.keys(nextState).length ? nextState : null,
    });
  }, [location.pathname, location.state, navigate, show]);

  return (
    <div className="dashboard-root flex h-screen overflow-hidden" style={{ background: CHARCOAL }}>
      {/* Background Layers */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(900px 500px at 15% 0%, rgba(212,175,55,0.15), transparent 65%),
                         radial-gradient(700px 400px at 85% 20%, rgba(255,215,0,0.1), transparent 65%)`,
          }}
        />
        <div className="absolute inset-0 dot-grid opacity-20" />
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0 relative z-10 transition-all duration-300">
        <Navbar isOpen={isOpen} onMenuClick={toggleSidebar} />

        <main className="flex-1 overflow-y-auto pt-24 pb-12 px-4 md:px-6 lg:px-8 min-h-0 flex flex-col">
          <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-[1600px] mx-auto w-full flex-1 min-h-0 flex flex-col"
          >
            <Outlet />
          </Motion.div>
        </main>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default DashboardLayout;
