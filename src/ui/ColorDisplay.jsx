import { Check } from "lucide-react";

export default function ColorDisplay({ color, selected = false, justDisplay = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`color-display ${selected ? "selected" : ""} ${justDisplay ? "just-display" : ""}`}
      style={{ background: color }}
    >
      {selected && <Check size={16} />}
    </div>
  );
}
