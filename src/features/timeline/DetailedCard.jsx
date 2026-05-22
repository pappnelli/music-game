export default function DetailedCard({ year, artist, title }) {
  return (
    <div className="detailed-card">
      <span style={{ height: "32px", placeContent: "center" }}>{artist}</span>
      <span style={{ fontSize: "20px", padding: "0.5rem 0", fontWeight: "bold" }}>{year}</span>
      <span style={{ height: "32px", placeContent: "center" }}>{title}</span>
    </div>
  );
}
