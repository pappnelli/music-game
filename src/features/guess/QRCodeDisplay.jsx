export default function QRCodeDisplay({ qrImage }) {
  if (!qrImage) return null;

  return (
    <div className="qr-code">
      <img src={qrImage} alt="QR code" style={{ height: "100%", borderRadius: "8px" }} />
    </div>
  );
}
