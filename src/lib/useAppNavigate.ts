"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useNavigationLoading } from "@/components/NavigationLoadingProvider";

/**
 * Wraps next/navigation's router.push so every page-to-page navigation
 * shows the same loading screen used while the song catalog loads.
 */
export function useAppNavigate() {
  const router = useRouter();
  const { startNavigating } = useNavigationLoading();

  return useCallback(
    (href: string, message?: string) => {
      startNavigating(message);
      router.push(href);
    },
    [router, startNavigating],
  );
}
