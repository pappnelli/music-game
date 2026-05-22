export default function NumberInput({ placeholder = "", value, onChange, onMinusClick, onPlusClick }) {
  return (
    <div className="number-input-div">
      <input className="number-input" type="number" placeholder={placeholder} value={value} onChange={onChange} />
      <div className="btn minus" onClick={onMinusClick}>
        −
      </div>
      <div className="btn plus" onClick={onPlusClick}>
        +
      </div>
    </div>
  );
}
