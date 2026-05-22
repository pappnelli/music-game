export default function AnswerDisplay({ year, artist, title }) {
  return (
    <div className="answer">
      <span style={{ height: "84.36px", placeContent: "center" }}>{artist}</span>
      <span style={{ fontSize: "56px", padding: "0.5rem 0", fontWeight: "bold", flex: 1, placeContent: "center" }}>{year}</span>
      <span style={{ height: "84.36px", placeContent: "center" }}>{title}</span>
    </div>
  );
}
