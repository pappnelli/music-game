"use client";

import { CSSProperties, RefObject, useCallback, useEffect, useState } from "react";

interface EdgeFadeState {
  canScrollStart: boolean;
  canScrollEnd: boolean;
}

const FADE_SIZE = "28px";

/**
 * Watches a scrollable element (via the ref you pass in) and returns a mask-image style that
 * fades its start/end edge (left/right for "x", top/bottom for "y") whenever there's more
 * content hidden past it -- a soft, self-updating cue that there's more to scroll, instead of
 * content just getting clipped by the container's border.
 *
 * Usage: `const ref = useRef<HTMLDivElement>(null); const style = useEdgeFadeStyle(ref, "x");
 * <div ref={ref} style={style} className="overflow-x-auto">`
 */
export function useEdgeFadeStyle<T extends HTMLElement>(ref: RefObject<T | null>, axis: "x" | "y"): CSSProperties | undefined {
  const [{ canScrollStart, canScrollEnd }, setState] = useState<EdgeFadeState>({
    canScrollStart: false,
    canScrollEnd: false,
  });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const [scrollPos, scrollSize, clientSize] =
      axis === "x" ? [el.scrollLeft, el.scrollWidth, el.clientWidth] : [el.scrollTop, el.scrollHeight, el.clientHeight];

    const nextCanScrollStart = scrollPos > 1;
    const nextCanScrollEnd = scrollPos < scrollSize - clientSize - 1;

    setState((prev) =>
      prev.canScrollStart === nextCanScrollStart && prev.canScrollEnd === nextCanScrollEnd
        ? prev
        : { canScrollStart: nextCanScrollStart, canScrollEnd: nextCanScrollEnd },
    );
  }, [axis, ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    measure();

    // Catches the container's own box changing size (e.g. the window resizing).
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(el);

    // Catches the *content* changing size while the container's own box stays fixed -- e.g. a
    // flex-1 list that only starts overflowing once another row gets added. ResizeObserver alone
    // misses this because the container's own layout box never changes size in that case.
    const mutationObserver = new MutationObserver(measure);
    mutationObserver.observe(el, { childList: true, subtree: true, characterData: true });

    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure, ref]);

  if (!canScrollStart && !canScrollEnd) return undefined;

  const direction = axis === "x" ? "to right" : "to bottom";
  const gradient = `linear-gradient(${direction}, ${canScrollStart ? "transparent" : "black"} 0%, black ${FADE_SIZE}, black calc(100% - ${FADE_SIZE}), ${canScrollEnd ? "transparent" : "black"} 100%)`;

  return { WebkitMaskImage: gradient, maskImage: gradient };
}
