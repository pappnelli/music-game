export default function TextInput({ ref, placeholder, value, onChange, onKeyDown }) {
  return (
    <input className="text-input" ref={ref} type="text" placeholder={placeholder} value={value} onChange={onChange} onKeyDown={onKeyDown} />
  );
}
