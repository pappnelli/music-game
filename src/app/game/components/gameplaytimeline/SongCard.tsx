import Disc from "@/components/Disc";
import { Song } from "@/lib/store/gameSlice";
import { Music2, Sparkles } from "lucide-react";

interface SongCardProps {
  song: Song;
  size?: string;
}

/** Warm tinted-gradient body shared by every size -- fully opaque, no glow/shine highlight. */
const CARD_BG =
  "bg-[linear-gradient(165deg,color-mix(in_oklch,var(--primary),var(--background)_85%),var(--background)_50%)] border-[color-mix(in_oklch,var(--primary),transparent_50%)]";

const BAR = <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-accent" />;

export default function SongCard({ song, size = "large" }: SongCardProps) {
  const { year, artist, title } = song;

  if (size === "small") {
    return (
      <div
        className={`group relative flex w-14 shrink-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-lg border-2 ${CARD_BG} px-1.5 py-2 text-center shadow-[0_3px_0_0_color-mix(in_oklch,var(--primary),black_20%)] transition-all hover:z-10 hover:-translate-y-0.5 hover:scale-105`}
        title={`${artist} — ${title}`}
      >
        <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
        <span className="relative text-base font-black text-foreground">{year}</span>
      </div>
    );
  }

  if (size === "medium") {
    // Straddles the top edge with a Disc badge -- the top bar lives in its own clipped layer so
    // it stays inside the rounded corners without clipping the badge, which pokes out on purpose.
    return (
      <div
        className={`group relative mt-4 flex w-28 shrink-0 flex-col items-center gap-0.5 rounded-2xl border-2 ${CARD_BG} px-2 pt-5 pb-3 text-center shadow-[0_4px_0_0_color-mix(in_oklch,var(--primary),black_20%)] transition-all hover:z-10 hover:-translate-y-1 sm:w-32`}
      >
        <span aria-hidden className="absolute inset-0 overflow-hidden rounded-[inherit]">
          {BAR}
        </span>

        <Disc size={34} className="absolute -top-[17px] left-1/2 -translate-x-1/2" shadow="0 3px 0 0 color-mix(in oklch, var(--primary), black 25%)" />

        <span className="relative mt-2 text-lg font-black text-foreground">{year}</span>
        <span className="relative w-full truncate text-xs font-bold text-foreground" title={artist}>
          {artist}
        </span>
        <span className="relative w-full truncate text-[0.68rem] text-muted-foreground" title={title}>
          {title}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex w-full max-w-xs flex-col items-center gap-1 overflow-hidden rounded-3xl border-2 ${CARD_BG} p-6 pt-8 text-center shadow-[0_7px_0_0_color-mix(in_oklch,var(--primary),black_25%)] [animation:pop-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)]`}
    >
      {BAR}

      <Sparkles aria-hidden className="absolute top-4 left-4 size-4 text-accent/70 [animation:pop-in_2.2s_ease-in-out_infinite]" />
      <Sparkles aria-hidden className="absolute right-5 bottom-5 size-3 text-secondary/70 [animation:pop-in_2.6s_ease-in-out_infinite] [animation-delay:0.3s]" />
      <Music2 aria-hidden className="absolute top-6 right-6 size-4 text-primary/60 [animation:token-float_3s_ease-in-out_infinite]" />
      <Music2 aria-hidden className="absolute bottom-8 left-6 size-3.5 text-accent/60 [animation:token-float_2.6s_ease-in-out_infinite] [animation-delay:0.5s]" />

      <Disc size={66} className="relative mb-1" shadow="0 4px 0 0 color-mix(in oklch, var(--primary), black 25%)" />

      <span className="relative bg-gradient-to-r from-primary to-secondary bg-clip-text text-5xl font-black tracking-tight text-transparent">{year}</span>
      <div className="relative flex flex-col gap-0.5">
        <span className="text-base font-bold text-foreground">{artist}</span>
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
    </div>
  );
}
