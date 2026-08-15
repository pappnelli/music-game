"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether a CSS media query currently matches. Starts `false` (safe default for SSR)
 * and syncs to the real value on mount, then stays live via the MediaQueryList change event.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    function handleChange(e: MediaQueryListEvent) {
      setMatches(e.matches);
    }

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
