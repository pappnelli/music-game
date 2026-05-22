import Button from "../../ui/Button";

export default function StartGameButton({ onClick, disabled }) {
  return (
    <div style={{ textAlign: "right" }}>
      <Button
        onClick={onClick}
        disabled={disabled}
        style={{
          padding: "1rem 2rem",
          fontSize: "1.2rem",
          cursor: "pointer",
        }}
      >
        Start game
      </Button>
    </div>
  );
}
