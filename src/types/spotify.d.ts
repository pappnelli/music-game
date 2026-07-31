export {};

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any; // Itt az 'any' teljesen rendben van, mert a Spotify objektum szerkezete külső
  }
}