import { sql } from "drizzle-orm";
import { db } from "../src/db";
import { songs } from "../src/db/schema";

async function main() {
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(songs);
  const [{ withAlbum }] = await db.select({ withAlbum: sql<number>`count(*) filter (where album is not null)` }).from(songs);

  console.log(`Total rows: ${count}`);
  console.log(`Rows with album set: ${withAlbum}`);

  const spotChecks = [
    { artist: "ABBA", title: "Dancing Queen" },
    { artist: "Aretha Franklin", title: "Respect" },
    { artist: "Alan Walker", title: "Alone" },
    { artist: "2 Unlimited", title: "No Limit" },
  ];

  console.log("\n--- Spot checks ---");
  for (const check of spotChecks) {
    const rows = await db
      .select()
      .from(songs)
      .where(sql`${songs.artist} ilike ${check.artist} and ${songs.title} ilike ${check.title}`);
    if (rows.length === 0) {
      console.log(`${check.artist} - ${check.title}: NOT FOUND`);
    } else {
      for (const r of rows) {
        console.log(`${r.artist} - ${r.title}: year=${r.year} album=${r.album ?? "(none)"}`);
      }
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
