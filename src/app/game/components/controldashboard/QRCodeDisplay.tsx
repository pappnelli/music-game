"use client";

import { ReactQRCode } from "@lglab/react-qr-code";

interface Props {
  spotifyId: string | undefined;
}

export default function QRCodeDisplay({ spotifyId }: Props) {
  if (!spotifyId) {
    return <div className="text-slate-500 text-sm">Nincs betöltve zene...</div>;
  }

  return (
    <div className="border-2 border-primary ring-2 ring-app-white rounded-md backdrop-blur-md bg-app-black">
      <ReactQRCode
        level="L"
        size={160}
        value={spotifyId}
        dataModulesSettings={{ style: "rounded", color: "var(--app-white)" }}
        finderPatternOuterSettings={{ style: "rounded", color: "var(--app-white)" }}
        finderPatternInnerSettings={{ style: "rounded", color: "var(--app-white)" }}
      />
    </div>
  );
}
