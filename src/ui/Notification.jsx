import { X } from "lucide-react";
import IconButton from "./IconButton";

export default function Notification({ type, fade, children, onClose }) {
  return (
    <div className={`notification ${type} ${fade ? "hide" : "show"}`}>
      <span className="message">{children}</span>

      <IconButton className="close-btn" onClick={onClose}>
        <X size={16} />
      </IconButton>
    </div>
  );
}
