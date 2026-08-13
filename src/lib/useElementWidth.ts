"use client";

import { RefObject, useLayoutEffect, useState } from "react";

/**
 * Tracks an element's content-box width in pixels via ResizeObserver, so a
 * child can be sized to exactly fill whatever space its container has.
 * Measures synchronously before first paint (useLayoutEffect) to avoid a
 * flash from 0 to the real width.
 */
export function useElementWidth<T extends HTMLElement>(ref: RefObject<T | null>): number {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    setWidth(el.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}
