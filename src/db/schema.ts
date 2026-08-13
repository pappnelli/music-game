import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

/**
 * Song catalog. `id` mirrors the "{year}-{index}" format the app already
 * generates client-side, so existing team/timeline references stay valid.
 */
export const songs = pgTable("songs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  year: integer("year").notNull(),
  genres: text("genres").array().notNull().default([]),
  album: text("album"),
  spotifyId: text("spotify_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SongRow = typeof songs.$inferSelect;
export type NewSongRow = typeof songs.$inferInsert;
