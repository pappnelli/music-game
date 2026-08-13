CREATE TABLE "songs" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"artist" text NOT NULL,
	"year" integer NOT NULL,
	"genres" text[] DEFAULT '{}' NOT NULL,
	"spotify_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
