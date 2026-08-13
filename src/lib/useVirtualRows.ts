"use client";

import { RefObject, useCallback, useEffect, useState } from "react";

interface VirtualRowsResult {
  /** First item index that should be rendered. */
  startIndex: number;
  /** One past the last item index that should be rendered. */
  endIndex: number;
}

/**
 * Minimal fixed-height row virtualizer for a scrollable container: tracks scroll position and
 * viewport height, and returns the slice of item indices that should actually be rendered (plus
 * `overscan` extra rows on each side above/below the viewport), so a long list only ever mounts a
 * couple dozen DOM rows regardless of total item count.
 *
 * No dependency needed for this -- assumes every row is exactly `rowHeight` px tall, which callers
 * must enforce (single-line/truncated cell content, no wrapping) for the scroll math to hold.
 * Pair with two spacer rows (`startIndex * rowHeight` tall, `(itemCount - endIndex) * rowHeight`
 * tall) around the rendered slice to keep the container's scrollable height correct.
 */
export function useVirtualRows<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  itemCount: number,
  rowHeight: number,
  overscan = 8,
): VirtualRowsResult {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setScrollTop(el.scrollTop);
    setViewportHeight(el.clientHeight);
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(el);

    // rAF-throttled so fast scrolling doesn't queue more state updates than the browser can paint.
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
    };
    // `itemCount` is included deliberately, not because the listeners depend on it: `containerRef`
    // and `measure` never change identity, so without it this effect would only ever run once, on
    // the very first commit. If the container is still conditionally unmounted at that point (e.g.
    // behind a loading check, as in BackstageClient), `containerRef.current` is null forever and
    // the viewport height never gets measured -- every list silently caps at `overscan` rows.
    // `itemCount` reliably flips from 0 the moment real data (and the real container) shows up, so
    // using it here re-triggers setup right when there's finally something to measure.
  }, [measure, containerRef, itemCount]);

  if (itemCount === 0 || rowHeight <= 0) {
    return { startIndex: 0, endIndex: 0 };
  }

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(itemCount, Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan);

  return { startIndex, endIndex };
}
