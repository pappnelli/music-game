"use client";

import Disc from "@/components/Disc";
import { useElementWidth } from "@/lib/useElementWidth";
import { ReactQRCode } from "@lglab/react-qr-code";
import { QrCode } from "lucide-react";
import { useRef } from "react";

interface Props {
  spotifyId: string | undefined;
  /** Tints the panel + disc badge, e.g. to the current team's color. Defaults to primary. */
  color?: string;
}

export default function QRCodeDisplay({ spotifyId, color = "var(--primary)" }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const frameWidth = useElementWidth(frameRef);
  const qrSize = Math.max(1, Math.floor(frameWidth));

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
      ref={frameRef}
      className="relative mt-4 w-full shrink-0 rounded-3xl border-2 p-4 pt-5 mb-2"
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

      <ReactQRCode
        level="Q"
        size={qrSize}
        value={spotifyId}
        // The exact same primary -> secondary -> accent sweep as the top bar right above it
        // (and the headline text on Home) -- the app's one recurring brand gradient, applied
        // uniformly across the data modules and both finder-pattern layers so the whole code
        // reads as one on-brand surface instead of colored eyes on a plain black grid. Fixed
        // hex, not theme-tokenized, so the surface never changes between themes.
        // `level="Q"` adds real redundancy since a bright gradient has less raw contrast than
        // solid ink -- cheap for a payload this short.
        gradient={{
          type: "linear",
          rotation: 0,
          stops: [
            { offset: "0%", color: "#ff2ec4" },
            { offset: "50%", color: "#9b30ff" },
            { offset: "100%", color: "#00b8d4" },
          ],
        }}
        dataModulesSettings={{ style: "rounded" }}
        finderPatternOuterSettings={{ style: "rounded" }}
        finderPatternInnerSettings={{ style: "circle" }}
        svgProps={{ style: { display: "block" } }}
      />
    </div>
  );
}
