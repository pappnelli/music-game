"use client";

import GenreSelector from "@/app/setup/components/GenreSelector";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SongRow } from "@/db/schema";
import { Disc3, Link2, Loader2, Music2, Pencil, Plus, User } from "lucide-react";
import { useState } from "react";

interface SongFormDialogProps {
  /** `null` closes the dialog. `"new"` opens it in create mode. A SongRow opens it pre-filled for editing. */
  target: SongRow | "new" | null;
  allGenres: string[];
  onClose: () => void;
  onSaved: (song: SongRow) => void;
}

interface FormState {
  title: string;
  artist: string;
  year: string;
  genres: string[];
  album: string;
  spotifyId: string;
}

const EMPTY_FORM: FormState = { title: "", artist: "", year: "", genres: [], album: "", spotifyId: "" };

function songToForm(song: SongRow): FormState {
  return {
    title: song.title,
    artist: song.artist,
    year: String(song.year),
    genres: song.genres,
    album: song.album ?? "",
    spotifyId: song.spotifyId ?? "",
  };
}

export default function SongFormDialog({ target, allGenres, onClose, onSaved }: SongFormDialogProps) {
  const isOpen = target !== null;
  const isEditing = isOpen && target !== "new";

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Re-seed the form whenever a different song (or a fresh "new" request) opens the dialog --
  // adjusted during render rather than in an effect, same pattern as EditTeamDialog.
  const targetKey = target === null ? null : target === "new" ? "new" : target.id;
  const [prevTargetKey, setPrevTargetKey] = useState<string | null>(null);

  if (isOpen && targetKey !== prevTargetKey) {
    setPrevTargetKey(targetKey);
    setForm(target === "new" ? EMPTY_FORM : songToForm(target as SongRow));
    setError(null);
  }

  if (!isOpen) return null;

  const yearNumber = Number(form.year);
  const isValid = form.title.trim() && form.artist.trim() && form.year.trim() && Number.isFinite(yearNumber) && form.genres.length > 0;

  async function handleSave() {
    if (!isValid || isSaving) return;
    setIsSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      artist: form.artist.trim(),
      year: yearNumber,
      genres: form.genres,
      album: form.album.trim() || null,
      spotifyId: form.spotifyId.trim() || null,
    };

    try {
      const response = await fetch(isEditing ? `/api/backstage/songs/${(target as SongRow).id}` : "/api/backstage/songs", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError(body?.error ?? "Something went wrong.");
        return;
      }

      onSaved(body as SongRow);
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 shadow-[0_3px_0_0_color-mix(in_oklch,var(--primary),black_25%)]">
              {isEditing ? <Pencil className="size-4 text-primary" /> : <Plus className="size-4 text-primary" />}
            </span>
            {isEditing ? "Edit song" : "Add song"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="song-title" className="gap-1.5">
                <Music2 className="size-4 text-primary" />
                Title
              </Label>
              <Input id="song-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Song title" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="song-year" className="gap-1.5">
                <Disc3 className="size-4 text-secondary" />
                Year
              </Label>
              <Input
                id="song-year"
                type="number"
                inputMode="numeric"
                className="sm:w-28"
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                placeholder="1999"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="song-artist" className="gap-1.5">
              <User className="size-4 text-secondary" />
              Artist
            </Label>
            <Input id="song-artist" value={form.artist} onChange={(e) => setForm((f) => ({ ...f, artist: e.target.value }))} placeholder="Artist name" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="song-album">Album</Label>
            <Input
              id="song-album"
              value={form.album}
              onChange={(e) => setForm((f) => ({ ...f, album: e.target.value }))}
              placeholder="Optional"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="song-spotify" className="gap-1.5">
              <Link2 className="size-4 text-accent" />
              Spotify ID
            </Label>
            <Input
              id="song-spotify"
              value={form.spotifyId}
              onChange={(e) => setForm((f) => ({ ...f, spotifyId: e.target.value }))}
              placeholder="Optional — track ID, not the full URL"
            />
          </div>

          <GenreSelector genres={allGenres} selected={form.genres} onChange={(genres) => setForm((f) => ({ ...f, genres }))} />

          {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!isValid || isSaving}>
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {isEditing ? "Save changes" : "Add song"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
