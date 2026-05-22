import NumberInput from "../../ui/NumberInput";

export default function SongsPerYearSelector({ value, onChange }) {
  return (
    <NumberInput
      placeholder="No limit"
      value={value || ""}
      onChange={(e) => onChange(!e.target.value || Number(e.target.value) >= 1 ? Number(e.target.value) : 1)}
      onMinusClick={() => onChange(value > 1 ? Number(value) - 1 : 1)}
      onPlusClick={() => onChange(Number(value) + 1)}
    />
  );
}
