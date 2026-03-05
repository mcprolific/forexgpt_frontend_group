import React from "react";
import { motion as Motion } from "framer-motion";

const Modal = ({ open, onClose, children, title, footer, glass = true, size = "lg" }) => {
  if (!open) return null;
  const width = size === "sm" ? "max-w-sm" : size === "xl" ? "max-w-2xl" : "max-w-lg";
  const panel = glass
    ? "bg-zinc-900/70 backdrop-blur border border-white/10 text-gray-100"
    : "bg-white text-gray-900";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <Motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={`relative w-full ${width} rounded-2xl shadow-2xl p-6 ${panel}`}
      >
        <div className="flex items-start justify-between mb-3">
          {title ? <div className="text-lg font-semibold">{title}</div> : <div />}
          <button onClick={onClose} className="px-2 py-1 rounded-lg hover:bg-white/5">✕</button>
        </div>
        <div>{children}</div>
        {footer ? <div className="mt-6">{footer}</div> : null}
      </Motion.div>
    </div>
  );
};

export default Modal;
