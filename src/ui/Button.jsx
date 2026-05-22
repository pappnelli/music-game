export default function Button({ children, onClick, className = "", style = {}, disabled = false, type = "button" }) {
  return (
    <button type={type} onClick={disabled ? undefined : onClick} className={`button ${className}`} style={style} disabled={disabled}>
      {children}
    </button>
  );
}
