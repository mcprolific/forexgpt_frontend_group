import React from "react";

const Badge = ({ children, className = "", variant = "glass", color = "emerald" }) => {
  const colorMap = {
    emerald: { text: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10", border: "border-[#D4AF37]/30" },
    violet: { text: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-400/30" },
    sky: { text: "text-sky-300", bg: "bg-sky-500/10", border: "border-sky-400/30" },
    neutral: { text: "text-gray-300", bg: "bg-white/5", border: "border-white/10" },
    danger: { text: "text-red-300", bg: "bg-red-500/10", border: "border-red-400/30" },
    success: { text: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10", border: "border-[#D4AF37]/30" },
    warning: { text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-400/30" },
  };
  const c = colorMap[color] || colorMap.emerald;
  const base =
    variant === "solid"
      ? `${c.text} ${c.bg}`
      : `backdrop-blur ${c.bg} border ${c.border}`;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${base} ${className}`}>{children}</span>;
};

export default Badge;
