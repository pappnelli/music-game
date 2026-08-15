"use client";

import { usePathname } from "next/navigation";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import NavigationLoadingOverlay from "./NavigationLoadingOverlay";

interface NavigationLoadingContextValue {
  startNavigating: (message?: string) => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextValue | null>(null);

// Safety net in case a navigation never changes the pathname (e.g. it gets
// intercepted or fails), so the overlay can never get stuck on screen.
const SAFETY_TIMEOUT_MS = 4000;

/**
 * Remounts every time `pathname` changes (via the `key` prop below), so its
 * mount effect fires exactly once the destination page has taken over.
 * That's the signal to dismiss the loading overlay.
 */
function RouteChangeListener({ onRouteReady }: { onRouteReady: () => void }) {
  useEffect(() => {
    onRouteReady();
  }, [onRouteReady]);

  return null;
}

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [message, setMessage] = useState("Loading…");
  const pathname = usePathname();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearOverlay = useCallback(() => {
    setIsNavigating(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Stable identity via useCallback: this goes into context, and downstream consumers
  // (e.g. useAppNavigate) memoize against it -- a fresh function reference on every render
  // here silently breaks that memoization for every consumer in the app.
  const startNavigating = useCallback((nextMessage = "Loading…") => {
    setMessage(nextMessage);
    setIsNavigating(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsNavigating(false), SAFETY_TIMEOUT_MS);
  }, []);

  const contextValue = useMemo(() => ({ startNavigating }), [startNavigating]);

  return (
    <NavigationLoadingContext.Provider value={contextValue}>
      <RouteChangeListener key={pathname} onRouteReady={clearOverlay} />
      {children}
      {isNavigating && <NavigationLoadingOverlay message={message} />}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading() {
  const ctx = useContext(NavigationLoadingContext);
  if (!ctx) {
    throw new Error("useNavigationLoading must be used within a NavigationLoadingProvider");
  }
  return ctx;
}
