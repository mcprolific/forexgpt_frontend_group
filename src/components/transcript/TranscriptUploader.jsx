import { useTheme } from "../../context/ThemeContext";

const TranscriptUploader = ({ onUpload }) => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const BG = isLight ? "#ffffff" : "#242424";
  const TEXT = isLight ? "#1A1A1A" : "#f3f4f6";

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="rounded-xl shadow p-4 border transition-colors duration-300"
      style={{ background: BG, color: TEXT, borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)" }}>
      <div className="font-semibold mb-2">Upload Transcript</div>
      <input type="file" accept=".txt,.pdf,.md" onChange={handleChange}
        className={isLight ? "text-gray-700" : "text-gray-300"} />
    </div>
  );
};

export default TranscriptUploader;
