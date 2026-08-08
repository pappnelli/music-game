import { Disc3, Music2, Radio, Sparkles } from "lucide-react";

/**
 * The app's shared screen backdrop: one smooth diagonal gradient through the brand palette
 * (violet -> cyan -> hero pink) over the theme's base background, plus a handful of big,
 * low-opacity, gently animated icons -- nothing else. Every screen (Home, Setup, Game, End)
 * uses this same recipe so the app feels consistent from the first screen to the last.
 *
 * Render as the first child of a `relative` page container; it's absolutely positioned with a
 * negative z-index, so it never needs the rest of the page's content to be repositioned.
 */
export default function AppBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[linear-gradient(150deg,color-mix(in_oklch,var(--secondary),var(--background)_78%)_0%,color-mix(in_oklch,var(--accent),var(--background)_82%)_45%,color-mix(in_oklch,var(--primary),var(--background)_76%)_100%)]"
    >
      <Disc3 className="absolute -left-10 top-16 size-40 animate-[spin_18s_linear_infinite] text-primary/10" />
      <Music2 className="absolute right-6 top-24 size-16 rotate-12 text-secondary/20 [animation:token-float_4s_ease-in-out_infinite]" />
      <Radio className="absolute bottom-16 left-10 size-20 -rotate-12 text-accent/20 [animation:token-float_5s_ease-in-out_infinite] [animation-delay:0.6s]" />
      <Sparkles className="absolute right-16 bottom-28 size-10 text-primary/25 [animation:pop-in_2.4s_ease-in-out_infinite]" />
      <Music2 className="absolute top-1/2 left-8 size-8 -rotate-6 text-primary/15 [animation:token-float_3.6s_ease-in-out_infinite] [animation-delay:1.2s]" />
    </div>
  );
}
