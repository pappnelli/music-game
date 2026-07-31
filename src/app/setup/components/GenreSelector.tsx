"use client";

import { cn } from "@/lib/utils";

interface GenreSelectorProps {
  genres: string[];
  selected: string[];
  onChange: (newList: string[]) => void;
}

export default function GenreSelector({ genres, selected, onChange }: GenreSelectorProps) {
  function toggle(genre: string) {
    if (selected.includes(genre)) {
      onChange(selected.filter((g) => g !== genre));
    } else {
      onChange([...selected, genre]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Music Genre</label>
      <div className="flex flex-wrap gap-3">
        {genres.map((genre) => {
          const isChecked = selected.includes(genre);

          return (
            <div
              key={genre}
              onClick={() => toggle(genre)}
              className={cn(
                "cursor-pointer px-4 py-2 rounded-md border text-sm font-mono transition-all duration-300",
                isChecked
                  ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_var(--color-primary)]"
                  : "bg-app-black/40 border-border text-muted-foreground hover:border-secondary hover:text-secondary",
              )}
            >
              {genre.toUpperCase()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
