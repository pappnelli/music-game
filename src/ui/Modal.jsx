import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import IconButton from "./IconButton";

export default function Modal({ children, onClose }) {
  const modalRef = useRef(null);

  // ESC bezárás
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Fókuszcsapda
  useEffect(() => {
    const modal = modalRef.current;
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

    if (focusable.length === 0) return;

    let first = focusable[0];
    let last = focusable[focusable.length - 1];

    const trap = (e) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", trap);
    first.focus();

    return () => document.removeEventListener("keydown", trap);
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <IconButton className="modal-close" onClick={onClose}>
          <X size={16} />
        </IconButton>

        {children}
      </div>
    </div>
  );
}
