"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SongRow } from "@/db/schema";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteSongDialogProps {
  song: SongRow | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export default function DeleteSongDialog({ song, onClose, onDeleted }: DeleteSongDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!song) return null;

  async function handleDelete() {
    if (!song || isDeleting) return;
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/backstage/songs/${song.id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "Something went wrong.");
        return;
      }
      onDeleted(song.id);
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={!!song} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-destructive bg-destructive/10 shadow-[0_3px_0_0_color-mix(in_oklch,var(--destructive),black_25%)]">
              <Trash2 className="size-4 text-destructive" />
            </span>
            Delete song
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm font-medium text-muted-foreground">
          Remove <span className="font-bold text-foreground">{song.title}</span> by{" "}
          <span className="font-bold text-foreground">{song.artist}</span> from the catalog? This can&apos;t be undone.
        </p>

        {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
