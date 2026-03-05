import React from "react";
import Spinner from "./Spinner";

const Input = React.forwardRef(
  (
    {
      className = "",
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      loading = false,
      glass = true,
      color = "emerald",
      ...rest
    },
    ref
  ) => {
    const ring =
      color === "violet" ? "focus:ring-violet-500" : color === "sky" ? "focus:ring-sky-500" : "focus:ring-[#D4AF37]";
    const base = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${ring} ${glass ? "bg-black/40 border-white/10 text-gray-100" : ""}`;
    if (!label && !leftIcon && !rightIcon && !loading && !error && !helper) {
      return <input ref={ref} {...rest} className={`${base} ${className}`} />;
    }
    return (
      <div className="relative group">
        {label ? (
          <label
            htmlFor={rest.id}
            className={`absolute left-3 top-2.5 px-1 text-xs transition-all ${rest.value ? "translate-y-[-12px] text-[#D4AF37] bg-[#121212]" : "text-gray-400"
              } group-focus-within:translate-y-[-12px] group-focus-within:text-[#D4AF37] pointer-events-none`}
          >
            {label}
          </label>
        ) : null}
        <div className="relative">
          {leftIcon ? <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{leftIcon}</span> : null}
          <input
            ref={ref}
            {...rest}
            aria-invalid={!!error}
            className={`${base} ${leftIcon ? "pl-9" : ""} ${rightIcon || loading ? "pr-9" : ""} ${error ? "border-red-500/60" : ""
              } ${className}`}
          />
          {loading ? (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner className="h-4 w-4 text-gray-300" />
            </span>
          ) : rightIcon ? (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{rightIcon}</span>
          ) : null}
        </div>
        {error ? <div className="mt-1 text-xs text-red-400">{error}</div> : null}
        {!error && helper ? <div className="mt-1 text-xs text-gray-400">{helper}</div> : null}
      </div>
    );
  }
);

export default Input;
