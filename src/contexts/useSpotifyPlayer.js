import { useContext } from "react";
import { SpotifyPlayerContext } from "./SpotifyPlayerContext";

export const useSpotifyPlayer = () => useContext(SpotifyPlayerContext);
