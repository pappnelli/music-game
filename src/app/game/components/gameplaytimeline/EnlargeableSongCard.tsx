"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Song } from "@/lib/store/gameSlice";
import SongCard from "./SongCard";

interface EnlargeableSongCardProps {
  song: Song;
  /** Size of the card as it normally sits in the layout -- tapping it always previews at "large". */
  size: "small" | "medium";
}

/**
 * Wraps a compact SongCard so tapping/clicking it shows the full "large" card in a popover
 * anchored over the original spot, closing on outside click/Escape (Radix Popover default).
 */
export default function EnlargeableSongCard({ song, size }: EnlargeableSongCardProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Show ${song.artist} — ${song.title}`}
          className="cursor-pointer rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <SongCard song={song} size={size} />
        </button>
      </PopoverTrigger>

      <PopoverContent align="center" sideOffset={12} className="w-auto rounded-none border-0 bg-transparent p-0 shadow-none backdrop-blur-none">
        <SongCard song={song} size="large" />
      </PopoverContent>
    </Popover>
  );
}
