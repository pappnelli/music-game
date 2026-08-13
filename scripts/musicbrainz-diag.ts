/**
 * One-off diagnostic: figures out why the field-qualified Lucene query
 * is missing well-known songs on MusicBrainz.
 */
const USER_AGENT = "MusicGameByNelli/1.0 (pappnelli7@gmail.com)";

async function run(label: string, query: string) {
  const url = `https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(query)}&fmt=json&limit=5`;
  console.log(`\n--- ${label} ---`);
  console.log("URL:", url);

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Body (first 1500 chars):", text.slice(0, 1500));
}

async function main() {
  await run('Current approach: releasegroup:"X" AND artist:"Y"', 'releasegroup:"No Limit" AND artist:"2 Unlimited"');
  await run("Plain free text, no field qualifiers", "No Limit 2 Unlimited");
  await run('Quoted release field: release:"X" AND artist:"Y"', 'release:"No Limit" AND artist:"2 Unlimited"');
  await run("Unquoted field query", "releasegroup:No Limit AND artist:2 Unlimited");
}

main().catch((err) => console.error("Diagnostic failed:", err));
