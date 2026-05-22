import NumberInput from "../../ui/NumberInput";

export default function StartTokenSelector({ startingTokens, setStartingTokens }) {
  return (
    <NumberInput
      value={startingTokens}
      onChange={(e) => setStartingTokens(Number(e.target.value) >= 0 ? Number(e.target.value) : 0)}
      onMinusClick={() => setStartingTokens(startingTokens > 0 ? Number(startingTokens) - 1 : 0)}
      onPlusClick={() => setStartingTokens(Number(startingTokens) + 1)}
    />
  );
}
