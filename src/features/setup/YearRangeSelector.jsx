import NumberInput from "../../ui/NumberInput";

export default function YearRangeSelector({ yearStart, yearEnd, onStartChange, onEndChange }) {
  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <NumberInput
        placeholder="From"
        value={yearStart || ""}
        onChange={(e) => onStartChange(e.target.value)}
        onMinusClick={() => onStartChange(yearStart > 1 ? Number(yearStart) - 1 : 1)}
        onPlusClick={() => onStartChange(Number(yearStart) + 1)}
      />

      <NumberInput
        placeholder="To"
        value={yearEnd || ""}
        onChange={(e) => onEndChange(e.target.value)}
        onMinusClick={() => onEndChange(yearEnd > 1 ? Number(yearEnd) - 1 : 1)}
        onPlusClick={() => onEndChange(Number(yearEnd) + 1)}
      />
    </div>
  );
}
