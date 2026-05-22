import { Square, SquareCheck } from "lucide-react";

export default function CheckboxInput({ elem, checked, onChange }) {
  return (
    <>
      <label className="checkbox-input">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="box">{checked ? <SquareCheck size={16} /> : <Square size={16} />}</span>
        {elem}
      </label>
    </>
  );
}
