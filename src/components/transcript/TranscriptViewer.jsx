import { useTheme } from "../../contexts/ThemeContext";

const TranscriptViewer = ({ content }) => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const BG = isLight ? "#ffffff" : "#242424";
  const TEXT = isLight ? "#1A1A1A" : "#f3f4f6";
  const MUTED = isLight ? "#374151" : "#d1d5db";

  return (
    <div className="rounded-xl shadow p-4 whitespace-pre-wrap border transition-colors duration-300"
      style={{ background: BG, color: TEXT, borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)" }}>
      <div className="font-semibold mb-2">Transcript</div>
      <div className="text-sm" style={{ color: MUTED }}>{content || "No transcript loaded."}</div>
    </div>
  );
};

export default TranscriptViewer;
