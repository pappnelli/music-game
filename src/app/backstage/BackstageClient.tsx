"use client";

import AppBackground from "@/components/AppBackground";
import Disc from "@/components/Disc";
import ThemeToggle from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SongRow } from "@/db/schema";
import { useEdgeFadeStyle } from "@/lib/useEdgeFade";
import { useVirtualRows } from "@/lib/useVirtualRows";
import { cn } from "@/lib/utils";
import { Disc3, ExternalLink, ListMusic, LogOut, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import DeleteSongDialog from "./components/DeleteSongDialog";
import SongFormDialog from "./components/SongFormDialog";

// Every row must render at exactly this height for the virtualizer's scroll math to hold --
// keep genre/title/artist/album cells single-line (truncate, no wrapping) if you touch them.
const ROW_HEIGHT = 44;

export default function BackstageClient() {
  const router = useRouter();

  const [songs, setSongs] = useState<SongRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [formTarget, setFormTarget] = useState<SongRow | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SongRow | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSongs() {
      try {
        const response = await fetch("/api/backstage/songs");
        if (!response.ok) throw new Error();
        const data = (await response.json()) as SongRow[];
        if (!cancelled) setSongs(data);
      } catch {
        if (!cancelled) setLoadError("Couldn't load the song catalog. Refresh to try again.");
      }
    }

    loadSongs();
    return () => {
      cancelled = true;
    };
  }, []);

  const allGenres = useMemo(() => {
    if (!songs) return [];
    return Array.from(new Set(songs.flatMap((s) => s.genres))).sort((a, b) => a.localeCompare(b));
  }, [songs]);

  const filteredSongs = useMemo(() => {
    if (!songs) return [];
    const query = search.trim().toLowerCase();

    return songs.filter((song) => {
      const matchesGenre = genreFilter === "all" || song.genres.includes(genreFilter);
      if (!matchesGenre) return false;
      if (!query) return true;

      const haystack = `${song.title} ${song.artist} ${song.album ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [songs, search, genreFilter]);

  function handleSaved(song: SongRow) {
    setSongs((prev) => {
      if (!prev) return prev;
      const exists = prev.some((s) => s.id === song.id);
      return exists ? prev.map((s) => (s.id === song.id ? song : s)) : [...prev, song].sort((a, b) => a.year - b.year || a.artist.localeCompare(b.artist));
    });
    setFormTarget(null);
  }

  function handleDeleted(id: string) {
    setSongs((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
    setDeleteTarget(null);
  }

  async function handleLogout() {
    await fetch("/api/backstage/auth", { method: "DELETE" });
    router.push("/backstage/login");
    router.refresh();
  }

  const tableRef = useRef<HTMLDivElement>(null);
  const tableFadeStyle = useEdgeFadeStyle(tableRef, "y");

  // Only mount the rows currently in (or near) the viewport -- the catalog runs to 1500+ songs,
  // and rendering every row up front made typing in the search box noticeably laggy.
  const { startIndex, endIndex } = useVirtualRows(tableRef, filteredSongs.length, ROW_HEIGHT);
  const visibleSongs = filteredSongs.slice(startIndex, endIndex);
  const topSpacerHeight = startIndex * ROW_HEIGHT;
  const bottomSpacerHeight = (filteredSongs.length - endIndex) * ROW_HEIGHT;

  // A new search/genre filter can leave the scroll position pointing past the end of the
  // (now shorter) list, which would otherwise render nothing until the user manually scrolls up.
  useEffect(() => {
    tableRef.current?.scrollTo({ top: 0 });
  }, [search, genreFilter]);

  const isLoading = songs === null && !loadError;

  return (
    <div className="relative flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <AppBackground />

      <header className="flex items-center justify-between gap-3 border-b-2 border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Disc size={26} spin shadow="0 2px 0 0 color-mix(in oklch, var(--primary), black 30%)" />
          <div>
            <h1 className="text-lg font-black tracking-tight text-foreground sm:text-xl">Backstage</h1>
            <p className="hidden text-xs font-semibold text-muted-foreground sm:block">Song catalog editor</p>
          </div>
          {songs && (
            <Badge variant="outline" className="ml-1">
              {songs.length} songs
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="size-4" />
            Log out
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, artist or album…"
              className="pl-9"
              aria-label="Search songs"
            />
          </div>

          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <ListMusic className="size-4 text-primary" />
              <SelectValue placeholder="All genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genres</SelectItem>
              {allGenres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => setFormTarget("new")} className="sm:w-auto">
            <Plus className="size-4" />
            Add song
          </Button>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
          {isLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
              <Disc3 className="size-10 animate-[spin_1.4s_linear_infinite] text-primary" />
              <p className="text-sm font-bold tracking-wide text-muted-foreground uppercase">Loading the song catalog…</p>
            </div>
          ) : loadError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-sm font-bold text-destructive">{loadError}</p>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-sm font-bold text-muted-foreground">No songs match your search.</p>
            </div>
          ) : (
            <div ref={tableRef} style={tableFadeStyle} className="flex-1 overflow-y-auto">
              <Table className="table-fixed">
                {/* Fixed column widths (rather than content-driven auto layout) so columns don't
                    jump around as virtualization swaps different-length titles/artists in and out
                    of the DOM while scrolling. Title is the one column left unspecified, so it
                    absorbs whatever space the fixed columns don't use. */}
                <colgroup>
                  <col style={{ width: "4.5rem" }} />
                  <col />
                  <col style={{ width: "12rem" }} />
                  <col style={{ width: "11rem" }} />
                  <col style={{ width: "13rem" }} />
                  <col style={{ width: "4rem" }} />
                  <col style={{ width: "6rem" }} />
                </colgroup>
                <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl">
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Album</TableHead>
                    <TableHead>Genres</TableHead>
                    <TableHead>Spotify</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSpacerHeight > 0 && (
                    <tr aria-hidden style={{ height: topSpacerHeight }}>
                      <td colSpan={7} className="p-0" />
                    </tr>
                  )}

                  {visibleSongs.map((song) => {
                    const visibleGenres = song.genres.slice(0, 2);
                    const extraGenreCount = song.genres.length - visibleGenres.length;

                    return (
                      <TableRow key={song.id} className="h-11">
                        <TableCell className="font-black text-primary">{song.year}</TableCell>
                        <TableCell className="truncate font-bold text-foreground" title={song.title}>
                          {song.title}
                        </TableCell>
                        <TableCell className="truncate text-foreground" title={song.artist}>
                          {song.artist}
                        </TableCell>
                        <TableCell className="truncate text-muted-foreground" title={song.album ?? undefined}>
                          {song.album ?? "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-nowrap items-center gap-1 overflow-hidden" title={song.genres.join(", ")}>
                            {visibleGenres.map((genre) => (
                              <Badge key={genre} variant="outline" className="shrink-0 text-[0.65rem]">
                                {genre}
                              </Badge>
                            ))}
                            {extraGenreCount > 0 && (
                              <Badge variant="ghost" className="shrink-0 text-[0.65rem] text-muted-foreground">
                                +{extraGenreCount}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {song.spotifyId ? (
                            <a
                              href={`https://open.spotify.com/track/${song.spotifyId}`}
                              target="_blank"
                              rel="noreferrer"
                              className={cn("inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline")}
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon-sm" aria-label="Edit song" onClick={() => setFormTarget(song)}>
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Delete song"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteTarget(song)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {bottomSpacerHeight > 0 && (
                    <tr aria-hidden style={{ height: bottomSpacerHeight }}>
                      <td colSpan={7} className="p-0" />
                    </tr>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </main>

      <SongFormDialog target={formTarget} allGenres={allGenres} onClose={() => setFormTarget(null)} onSaved={handleSaved} />
      <DeleteSongDialog song={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />
    </div>
  );
}
