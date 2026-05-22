export default function Token({ color }) {
  return (
    <div className="token" style={{ border: `5px solid ${color}` }}>
      <div className="rainbow-circle" />
    </div>
  );
}
