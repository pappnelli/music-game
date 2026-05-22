import NumberInput from "../../ui/NumberInput";

export default function WinnerCardsSelector({ value, onChange }) {
  return (
    <NumberInput
      value={value}
      onChange={(e) => onChange(Number(e.target.value) >= 2 ? Number(e.target.value) : 2)}
      onMinusClick={() => onChange(value > 2 ? Number(value) - 1 : 2)}
      onPlusClick={() => onChange(Number(value) + 1)}
    />
  );
}
