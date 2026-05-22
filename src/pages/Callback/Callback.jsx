import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleSpotifyCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        console.error("No Spotify authorization code found.");
        navigate("/");
        return;
      }

      // PKCE verifier visszaolvasása
      const codeVerifier = localStorage.getItem("spotify_code_verifier");

      if (!codeVerifier) {
        console.error("No code_verifier found in localStorage.");
        navigate("/");
        return;
      }

      // Token csere body
      const body = new URLSearchParams({
        client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
        code_verifier: codeVerifier,
      });

      try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        });

        const data = await response.json();

        if (data.error) {
          console.error("Spotify token error:", data);
          navigate("/");
          return;
        }

        // Tokenek mentése
        localStorage.setItem("spotify_access_token", data.access_token);
        localStorage.setItem("spotify_refresh_token", data.refresh_token);
        localStorage.setItem("spotify_expires_in", data.expires_in.toString());
        localStorage.setItem("spotify_token_timestamp", Date.now().toString());

        // PKCE verifier törlése
        localStorage.removeItem("spotify_code_verifier");

        navigate("/");
      } catch (err) {
        console.error("Spotify token exchange failed:", err);
        navigate("/");
      }
    }

    handleSpotifyCallback();
  }, [navigate]);

  return <div>Connecting to Spotify…</div>;
}
