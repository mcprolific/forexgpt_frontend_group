import React from "react";
import { motion as Motion } from "framer-motion";

const Toast = ({ message, type = "info" }) => {
  const isSuccess = type === "success";
  const color =
    type === "error"
      ? "bg-red-600"
      : isSuccess
      ? "bg-[#D4AF37]"
      : "bg-indigo-600";
  const text = isSuccess ? "text-black" : "text-white";
  return (
    <Motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg ${text} shadow-2xl ${color} backdrop-blur`}
      role="status"
      aria-live="polite"
    >
      {message}
    </Motion.div>
  );
};

export default Toast;
