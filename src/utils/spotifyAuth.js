// spotifyAuth.js

// Random string generálása (code_verifier)
function generateRandomString(length) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// SHA-256 hash
async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

// Base64 URL encoding
function base64urlencode(buffer) {
  let str = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;

  for (let i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i]);
  }

  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Spotify login indítása PKCE-vel
export async function redirectToSpotifyLogin() {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error("Spotify CLIENT_ID or REDIRECT_URI is missing!");
    return;
  }

  // 1) Code verifier generálása
  const codeVerifier = generateRandomString(128);
  localStorage.setItem("spotify_code_verifier", codeVerifier);

  // 2) Code challenge generálása
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64urlencode(hashed);

  // 3) Scope-ok
  const scope = ["streaming", "user-read-email", "user-read-private", "user-modify-playback-state", "user-read-playback-state"].join(" ");

  // 4) Spotify auth URL összeállítása
  const authUrl =
    "https://accounts.spotify.com/authorize" +
    `?client_id=${clientId}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&code_challenge_method=S256` +
    `&code_challenge=${codeChallenge}` +
    `&scope=${encodeURIComponent(scope)}`;

  // 5) Átirányítás
  window.location.href = authUrl;
}
