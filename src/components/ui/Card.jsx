import React, { useCallback } from "react";
import { motion as Motion } from "framer-motion";

const Card = ({ children, className = "", glass = true, hover = true, tilt = false }) => {
  const onMove = useCallback((e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `perspective(900px) rotateX(${(-y / 120).toFixed(2)}deg) rotateY(${(x / 120).toFixed(2)}deg)`;
  }, []);
  const onLeave = useCallback((e) => {
    e.currentTarget.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  }, []);
  const base = glass
    ? "relative bg-zinc-900/60 border border-white/10 rounded-xl shadow-lg p-4 backdrop-blur"
    : "bg-white rounded-xl shadow p-4";
  const hoverCls = hover ? "transition will-change-transform hover:scale-[1.01] hover:shadow-amber-400/10" : "";
  const handlers = tilt ? { onMouseMove: onMove, onMouseLeave: onLeave } : {};
  return (
    <Motion.div
      {...handlers}
      whileHover={hover ? { y: -4 } : undefined}
      className={`${base} ${hoverCls} ${className}`}
    >
      {children}
    </Motion.div>
  );
};

export default Card;
