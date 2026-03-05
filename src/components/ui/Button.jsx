import React from "react";
import Spinner from "./Spinner";

const Button = ({
  children,
  className = "",
  variant = "solid",
  color = "emerald",
  loading = false,
  disabled,
  ...rest
}) => {
  const isDisabled = disabled || loading;
  const colorMap = {
    emerald: { bg: "bg-[#D4AF37]", hover: "hover:bg-[#FFD700]", ring: "focus:ring-[#D4AF37]", text: "text-black", border: "border-[#D4AF37]/50" },
    violet: { bg: "bg-violet-500", hover: "hover:bg-violet-400", ring: "focus:ring-violet-500", text: "text-black", border: "border-violet-400/50" },
    sky: { bg: "bg-sky-500", hover: "hover:bg-sky-400", ring: "focus:ring-sky-500", text: "text-black", border: "border-sky-400/50" },
  };
  const c = colorMap[color] || colorMap.emerald;
  const base = "px-4 py-2 rounded-lg transition will-change-transform focus:outline-none focus:ring-2 inline-flex items-center justify-center gap-2";
  const variants = {
    solid: `${c.bg} ${c.hover} ${c.text}`,
    outline: `border ${c.border} text-gray-200 hover:bg-white/5`,
    glass: `backdrop-blur bg-white/5 border border-white/10 text-gray-100 hover:bg-white/10`,
    ghost: `text-gray-200 hover:bg-white/5`,
  };
  const state = isDisabled ? "opacity-70 cursor-not-allowed" : "active:scale-[0.98]";
  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={`${base} ${variants[variant] || variants.solid} ${c.ring} ${state} ${className}`}
    >
      {loading ? <Spinner className={variant === "solid" ? "text-black" : "text-gray-300"} /> : null}
      {children}
    </button>
  );
};

export default Button;
