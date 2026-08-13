/**
 * One-off diagnostic: isolates whether Spotify's client-credentials flow
 * works at all for this app, separate from the batch-enrichment logic.
 */
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

async function main() {
  console.log("Client ID set:", !!clientId, clientId ? `(${clientId.slice(0, 4)}...)` : "");
  console.log("Client secret set:", !!clientSecret);

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  console.log("\n--- Token request ---");
  console.log("Status:", tokenRes.status);
  const tokenBody = await tokenRes.text();
  console.log("Body:", tokenBody);

  if (!tokenRes.ok) {
    console.log("\nToken request failed — stopping here. Fix credentials first.");
    return;
  }

  const { access_token } = JSON.parse(tokenBody);

  // Well-known public track id (Spotify's own docs example).
  const testTrackId = "11dFghVXANMlKmJXsNCbNl";
  const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${testTrackId}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  console.log("\n--- Single track request (GET /v1/tracks/{id}) ---");
  console.log("Status:", trackRes.status);
  console.log("Body:", await trackRes.text());

  // Isolate the batch endpoint specifically, with just one id.
  const batchOneRes = await fetch(`https://api.spotify.com/v1/tracks?ids=${testTrackId}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  console.log("\n--- Batch request, 1 id (GET /v1/tracks?ids=X) ---");
  console.log("Status:", batchOneRes.status);
  console.log("Body:", await batchOneRes.text());

  // Same, with an explicit market param.
  const batchMarketRes = await fetch(`https://api.spotify.com/v1/tracks?ids=${testTrackId}&market=US`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  console.log("\n--- Batch request, 1 id + market=US ---");
  console.log("Status:", batchMarketRes.status);
  console.log("Body:", await batchMarketRes.text());

  // Two ids, no market.
  const secondId = "3n3Ppam7vgaVa1iaRUc9Lp"; // Mr. Brightside
  const batchTwoRes = await fetch(`https://api.spotify.com/v1/tracks?ids=${testTrackId},${secondId}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  console.log("\n--- Batch request, 2 ids ---");
  console.log("Status:", batchTwoRes.status);
  console.log("Body:", await batchTwoRes.text());
}

main().catch((err) => console.error("Diagnostic failed:", err));
