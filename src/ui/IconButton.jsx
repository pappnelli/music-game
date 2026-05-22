export default function IconButton({ children, onClick, className = "", style = {}, disabled = false, type = "button" }) {
  return (
    <button type={type} onClick={disabled ? undefined : onClick} className={`icon-button ${className}`} style={style} disabled={disabled}>
      {children}
    </button>
  );
}
