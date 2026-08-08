"use client";

import Disc from "@/components/Disc";
import { ReactQRCode } from "@lglab/react-qr-code";
import { QrCode } from "lucide-react";

interface Props {
  spotifyId: string | undefined;
  /** Tints the panel + disc badge, e.g. to the current team's color. Defaults to primary. */
  color?: string;
}

export default function QRCodeDisplay({ spotifyId, color = "var(--primary)" }: Props) {
  if (!spotifyId) {
    return (
      <div className="flex aspect-square w-full max-w-32 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-center">
        <QrCode className="size-8 text-muted-foreground/50" />
        <p className="px-2 text-xs font-semibold text-muted-foreground">No track loaded</p>
      </div>
    );
  }

  // Songcard-like: same tinted-gradient body, top bar and straddling disc badge as the song
  // card, colorable via `color` (defaults to primary, can pick up the current team's color).
  // The scan surface itself stays fixed cream/ink -- never theme-tokenized -- so it keeps
  // scanning reliably in both themes.
  return (
    <div
      className="relative mt-4 w-fit shrink-0 rounded-3xl border-2 p-4 pt-5"
      style={{
        borderColor: `color-mix(in oklch, ${color}, transparent 50%)`,
        background: `linear-gradient(165deg, color-mix(in oklch, ${color}, var(--background) 85%), var(--background) 50%)`,
        boxShadow: `0 5px 0 0 color-mix(in oklch, ${color}, black 20%)`,
      }}
    >
      <span aria-hidden className="absolute inset-0 overflow-hidden rounded-[inherit]">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ background: "linear-gradient(90deg,var(--primary),var(--secondary),var(--accent))" }}
        />
      </span>

      <Disc
        size={34}
        colorA={color}
        colorB="var(--secondary)"
        className="absolute -top-[17px] left-1/2 -translate-x-1/2"
        shadow={`0 3px 0 0 color-mix(in oklch, ${color}, black 25%)`}
      />

      <div className="relative mt-2 rounded-xl bg-[#fdf9ff] p-2.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)]">
        <ReactQRCode
          level="L"
          size={132}
          value={spotifyId}
          dataModulesSettings={{ style: "rounded", color: "#201640" }}
          finderPatternOuterSettings={{ style: "rounded", color: "#201640" }}
          finderPatternInnerSettings={{ style: "rounded", color: "#201640" }}
        />
      </div>
    </div>
  );
}
