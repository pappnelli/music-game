"use client";

import { Label } from "@/components/ui/label";
import { genreLabel, isHungarianGenre } from "@/lib/genreLabels";
import { useEdgeFadeStyle } from "@/lib/useEdgeFade";
import { cn } from "@/lib/utils";
import { ChevronDown, Flag, Tags } from "lucide-react";
import { useRef, useState } from "react";

interface GenreSelectorProps {
  genres: string[];
  selected: string[];
  onChange: (newList: string[]) => void;
}

const chipClass = (isChecked: boolean, accent: "primary" | "accent" = "primary") =>
  cn(
    "rounded-full border-2 px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all active:scale-95",
    isChecked
      ? accent === "primary"
        ? "border-primary bg-primary/15 text-primary"
        : "border-accent bg-accent/15 text-accent"
      : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
  );

export default function GenreSelector({ genres, selected, onChange }: GenreSelectorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fadeStyle = useEdgeFadeStyle(ref, "y");
  const [isHunOpen, setIsHunOpen] = useState(false);

  const mainGenres = genres.filter((g) => !isHungarianGenre(g));
  const hunGenres = genres.filter(isHungarianGenre);

  const selectedHunCount = hunGenres.filter((g) => selected.includes(g)).length;
  const allHunSelected = hunGenres.length > 0 && selectedHunCount === hunGenres.length;
  const someHunSelected = selectedHunCount > 0 && !allHunSelected;

  const totalGenres = mainGenres.length + hunGenres.length;

  function toggle(genre: string) {
    if (selected.includes(genre)) {
      onChange(selected.filter((g) => g !== genre));
    } else {
      onChange([...selected, genre]);
    }
  }

  function toggleAllHungarian() {
    if (allHunSelected) {
      onChange(selected.filter((g) => !hunGenres.includes(g)));
    } else {
      onChange([...selected.filter((g) => !hunGenres.includes(g)), ...hunGenres]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="gap-1.5">
        <Tags className="size-4 text-primary" />
        Music genres
      </Label>

      {totalGenres === 0 ? (
        <p className="text-sm text-muted-foreground">Loading genres from the catalog…</p>
      ) : (
        <div ref={ref} style={fadeStyle} className="flex flex-col gap-2 py-0.5">
          <div className="flex flex-wrap gap-2">
            {mainGenres.map((genre) => {
              const isChecked = selected.includes(genre);
              return (
                <button type="button" key={genre} onClick={() => toggle(genre)} aria-pressed={isChecked} className={chipClass(isChecked)}>
                  {genreLabel(genre)}
                </button>
              );
            })}

            {hunGenres.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleAllHungarian}
                  aria-pressed={allHunSelected}
                  className={cn(chipClass(allHunSelected || someHunSelected), "flex items-center gap-1")}
                >
                  <Flag className="size-3" />
                  Hungarian
                </button>

                <button
                  type="button"
                  onClick={() => setIsHunOpen((v) => !v)}
                  aria-expanded={isHunOpen}
                  aria-label={isHunOpen ? "Hide Hungarian genres" : "Show Hungarian genres separately"}
                  className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-border bg-muted/40 text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground active:scale-95"
                >
                  <ChevronDown className={cn("size-3.5 transition-transform duration-200", isHunOpen && "rotate-180")} />
                </button>
              </div>
            )}
          </div>

          {isHunOpen && hunGenres.length > 0 && (
            <div className="ml-1 flex flex-wrap gap-1.5 border-l-2 border-accent/30 py-0.5 pl-3 [animation:pop-in_0.2s_ease-out_backwards]">
              {hunGenres.map((genre) => {
                const isChecked = selected.includes(genre);
                return (
                  <button
                    type="button"
                    key={genre}
                    onClick={() => toggle(genre)}
                    aria-pressed={isChecked}
                    className={chipClass(isChecked, "accent")}
                  >
                    {genreLabel(genre)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <p className="text-xs font-medium text-muted-foreground">
        {selected.length === 0 ? "No genre selected — all songs are excluded." : `${selected.length} of ${totalGenres} genres selected.`}
      </p>
    </div>
  );
}
