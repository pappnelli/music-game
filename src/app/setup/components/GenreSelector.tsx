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
  /** Igazra állítva (pl. "Hungarian songs only" mód) a genre chipek nem szűrnek — csak vizuálisan halványítjuk. */
  disabled?: boolean;
}

export default function GenreSelector({ genres, selected, onChange, disabled = false }: GenreSelectorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fadeStyle = useEdgeFadeStyle(ref, "y");

  // "Hun" saját, dedikált kontrollt kap (HunGenreSelector) — itt nem jelenik meg pill-ként.
  const visibleGenres = genres.filter((g) => g.trim().toLowerCase() !== "hun");

  function toggle(genre: string) {
    if (disabled) return;

    if (selected.includes(genre)) {
      onChange(selected.filter((g) => g !== genre));
    } else {
      onChange([...selected, genre]);
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", disabled && "opacity-50")}>
      <Label className="gap-1.5">
        <Tags className="size-4 text-primary" />
        Music genres
      </Label>

      {visibleGenres.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading genres from the catalog…</p>
      ) : (
        <div ref={ref} style={fadeStyle} className="flex max-h-40 flex-wrap gap-2 overflow-y-auto py-0.5">
          {visibleGenres.map((genre) => {
            const isChecked = selected.includes(genre);

            return (
              <button
                type="button"
                key={genre}
                onClick={() => toggle(genre)}
                disabled={disabled}
                aria-pressed={isChecked}
                className={cn(
                  "rounded-full border-2 px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all active:scale-95",
                  disabled && "pointer-events-none",
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
        {disabled
          ? "Genre filter is ignored while Hungarian songs only is active."
          : selected.length === 0
            ? "No genre selected — all songs are excluded."
            : `${selected.length} of ${visibleGenres.length} genres selected.`}
      </p>
    </div>
  );
}
