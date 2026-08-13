"use client";

import { Label } from "@/components/ui/label";
import { useEdgeFadeStyle } from "@/lib/useEdgeFade";
import { cn } from "@/lib/utils";
import { Tags } from "lucide-react";
import { useRef } from "react";

interface GenreSelectorProps {
  genres: string[];
  selected: string[];
  onChange: (newList: string[]) => void;
}

export default function GenreSelector({ genres, selected, onChange }: GenreSelectorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fadeStyle = useEdgeFadeStyle(ref, "y");

  function toggle(genre: string) {
    if (selected.includes(genre)) {
      onChange(selected.filter((g) => g !== genre));
    } else {
      onChange([...selected, genre]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="gap-1.5">
        <Tags className="size-4 text-primary" />
        Music genres
      </Label>

      {genres.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading genres from the catalog…</p>
      ) : (
        <div ref={ref} style={fadeStyle} className="flex max-h-40 flex-wrap gap-2 overflow-y-auto py-0.5">
          {genres.map((genre) => {
            const isChecked = selected.includes(genre);

            return (
              <button
                type="button"
                key={genre}
                onClick={() => toggle(genre)}
                aria-pressed={isChecked}
                className={cn(
                  "rounded-full border-2 px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all active:scale-95",
                  isChecked
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {genre}
              </button>
            );
          })}
        </div>
      )}

      <p className="text-xs font-medium text-muted-foreground">
        {selected.length === 0 ? "No genre selected — all songs are excluded." : `${selected.length} of ${genres.length} genres selected.`}
      </p>
    </div>
  );
}
