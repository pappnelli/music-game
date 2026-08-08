# Candy Neon — Design System

This document is the locked-in reference for the "Candy Neon" redesign, extracted from the approved mockup (`candy-neon-style-guide.html`). It exists so implementation in the real Next.js app can proceed component by component without re-litigating decisions already made. Where the mockup used a placeholder or a real component name is known from the codebase, both are noted.

## Philosophy

Bubblegum pink, electric violet, and neon cyan on a warm near-white (light) or deep violet-black (dark) base — never pure white or pure black anywhere. Every weight is bold-to-black; there is no thin type in the app. Every interactive surface gets a flat, colored, hard-edged "press" shadow (an offset solid rectangle, no blur) — there is no glow, halo, or blurred shadow anywhere. Motion is playful but restrained: gentle floats and spins on identity elements (discs, tokens, cards), no motion on things that are just sitting there being read.

## Color tokens

All colors are CSS custom properties, redefined per theme under `:root` (light) and `.dark`. Nothing is hardcoded to a raw hex outside of these variables, except the two fixed "always white/cream" values noted below.

**Light**
```
--background:#fdf0fb;      --foreground:#2a1240;
--card: rgba(255,248,253,0.9);      --card-foreground:#2a1240;
--popover: rgba(255,248,253,0.98);  --popover-foreground:#2a1240;
--primary:#ff2ec4;         --primary-foreground:#fff5fc;
--secondary:#9b30ff;       --secondary-foreground:#fff5fc;
--accent:#00d9f2;          --accent-foreground:#00272e;
--muted:#f8e0f4;           --muted-foreground:#8a5f8f;
--destructive:#e11d48;     --destructive-foreground:#fff3f5;
--border: rgba(255,46,196,0.25); --input: rgba(255,46,196,0.13); --ring:#ff2ec4;
```

**Dark**
```
--background:#1e0a2e;      --foreground:#fdeefc;
--card: rgba(48,20,58,0.72);        --card-foreground:#fdeefc;
--popover: rgba(38,14,48,0.97);     --popover-foreground:#fdeefc;
--primary:#ff4dd8;         --primary-foreground:#330029;
--secondary:#b366ff;       --secondary-foreground:#24063a;
--accent:#00f5ff;          --accent-foreground:#00272b;
--muted:#341a3f;           --muted-foreground:#d0a8d6;
--destructive:#ff4d6d;     --destructive-foreground:#2c0509;
--border: rgba(255,255,255,0.16); --input: rgba(255,255,255,0.08); --ring:#ff4dd8;
```

**Removed:** `--shadow-glow` and every `--glow-*` token from the current `globals.css`. No blurred/halo shadow exists in the new system — see Shadow system below.

**Team colors** — round-robin assigned per team, max 10 teams. Every team-owned element (name, token, timeline card, disc) is tinted to this color via a `--td-color` / `--tn-color` / `--tk-light` / `--tk-dark` custom property on the element, never a hardcoded class per team.

| Name | Light | Dark |
|---|---|---|
| Red | `#ff2969` | `#ff3b62` |
| Blue | `#1f8bff` | `#3aa3ff` |
| Green | `#00d264` | `#39ff8a` |
| Yellow | `#ffb300` | `#ffe14d` |
| Purple | `#a83bff` | `#cc8bff` |
| Orange | `#ff7300` | `#ff9d33` |
| Pink | `#ff3fc2` | `#ff67d6` |
| Cyan | `#00cfe8` | `#2df1ff` |
| Lime | `#a3e600` | `#c8ff4d` |
| White | `#2a1240` | `#f6f0ff` |

**Two fixed non-themed values**, used only for the disc/token label and the team-name outline stroke: `#fdf6ff` (cream-white) and its slightly-darkened variant for the label's spindle-hole dot. These stay constant across light/dark on purpose — they represent a physical paper label, not a UI surface.

## Typography

Font: **Sora Variable** everywhere, loaded from Google Fonts. Never a thin/regular-weight moment in the UI — body copy is 600, everything else is 700–900.

| Role | Size / weight |
|---|---|
| Display | 2.4–2.6rem / 900, tight tracking |
| H1 | 1.8rem / 900 |
| H2 (section label) | 0.85rem / 800, uppercase, +.04em tracking |
| Body | 0.9–0.95rem / 600 |
| Caption | 0.78rem / 700, muted-foreground |

**Team name** — one shared treatment used everywhere a team name appears (setup list, teams panel, team summary, round winner, after-reveal picker): bold, upright, filled with `--tn-color` (the team's color), with a 1.2px `#fdf6ff` text-stroke (`paint-order:stroke fill`) so it reads as a sticker outline against any background, plus a small drop-shadow for lift. Only color and font-size change per context — never re-styled per screen.

## Radius scale

| Token | Value | Used for |
|---|---|---|
| `radius-sm` | `.6rem` | chips, handles |
| `radius-lg` | `1.1rem` | cards, inputs |
| `radius-xl` | `1.6rem` | dialogs, hero elements |
| `full` | `999px` | buttons, badges, tokens, discs |

## Shadow system

One rule, no exceptions: every surface that needs to read as "raised" gets a flat, colored, hard 3D press shadow — `box-shadow: 0 Npx 0 0 <color>` — never blur, never a soft halo. `N` scales with element size (2–7px across the system). There is no glow/blur shadow anywhere in the app; "selected" or "current" states are communicated with a colored border plus a *stronger, more-saturated* version of the same hard shadow, never a soft glow ring.

- **Resting:** `box-shadow: 0 6px 0 0 var(--border)` (neutral).
- **Selected / active:** border switches to `var(--primary)` (or the relevant team/context color), shadow switches to `0 6px 0 0 color-mix(in oklch, <color>, black 25%)`.
- **Pressed:** shadow collapses to `0 0 0 0 transparent` and the element translates down by the shadow's own offset, simulating the shadow being "pushed in."

**Boxes, unified.** A bordered `.card` panel is the only "box" a screen needs. Rows/items living inside one — team status rows, radio options, team list items, team-pick rows — stay flat at rest (border + tinted background only, no shadow of their own), so they don't compete with the panel's shadow. Shadow is added back for exactly two reasons: it's a button (`.action-tile` always has one, since buttons must read as pressable), or it's the one row that matters right now (the active team, the selected teammate in "who called it"). Standalone panels that aren't part of a list — `.round-winner`, `.qr-panel`, the hero `.winner-card` — keep their own shadow since nothing else contains them.

## Screen background

One smooth diagonal gradient through the brand palette (violet → cyan → hero pink) laid over the theme's base background, plus a handful of big, low-opacity, gently animated line-icons (record, headphones/music-note, radio waves, sparkle) — nothing else. This is the same recipe the real `HomeClient.tsx` already uses; the mockup's `.app-bg` + `.app-bg-icons` extends it to every screen (Setup, Game, End), not just Home, so the app feels consistent from the first screen to the last.

```css
.app-bg{background:linear-gradient(150deg,
    color-mix(in oklch, var(--secondary), var(--background) 78%) 0%,
    color-mix(in oklch, var(--accent), var(--background) 82%) 45%,
    color-mix(in oklch, var(--primary), var(--background) 76%) 100%);}
```

Icons sit in an absolutely-positioned `.app-bg-icons` layer at `opacity` ~0.1 (via `color-mix(..., transparent 90%)` etc.), each with its own slow `spin` or `token-float` animation and a slight rotation offset so they don't feel mechanically identical.

## The disc

The single identity motif used for the app logo, every header brand mark, every song-card badge, and every team badge. It reads as an actual vinyl record: fine concentric grooves, a diagonal light/dark split painted across the surface (this is what makes the spin visible — plain concentric rings look identical at every rotation angle), and a record label with a punched spindle hole dead center.

**Structure — shadow must never rotate.** The outer element carries the border and the box-shadow and is *never itself animated*. A `.disc-face` child, absolutely positioned at `inset:0`, carries the groove texture and is the only thing that spins. This keeps the "this object is lit from above" cue fixed while the vinyl turns underneath it — exactly like a real record on a turntable. Elements that never spin (`.song-disc`, `.team-disc`) skip the child and paint the face directly on the outer element.

```css
.song-disc, .icon-disc, .home-disc .ring, .team-disc {
  border-radius:999px; position:relative; border:2px solid var(--card); overflow:hidden;
}

/* face texture — identical recipe for the static .song-disc and the spinning .disc-face,
   just swap the two base colors for team-tinted variants (see Team disc below) */
background-image:
  conic-gradient(from 135deg, rgba(255,255,255,.4) 0deg 177deg, rgba(255,255,255,.95) 177deg 183deg, rgba(0,0,0,.22) 183deg 360deg),
  repeating-radial-gradient(circle at center, var(--primary) 0px, var(--secondary) 2px, var(--primary) 3.5px);
background-blend-mode: overlay, normal;
```

The first layer is the diagonal split: one half tinted lighter, one half tinted darker, with a thin, bright white seam (177–183deg) right on the boundary — the same 135deg angle and light/dark-half language as `.token` (see below), so the disc and the token read as one family. `background-blend-mode:overlay` lets this tint sit over the groove color instead of replacing it. The second layer is the groove itself: a tight repeating radial gradient alternating the element's two base colors every ~1.75px.

**Record label** — a solid off-white circle inset 30–32%, always `#fdf6ff` regardless of theme (a physical label doesn't change color with dark mode), with a very subtle darker center dot standing in for the spindle hole and a small inset shadow for depth:

```css
.song-disc::after, .icon-disc::after, .home-disc .ring::after, .team-disc::after {
  content:""; position:absolute; inset:32%; /* team-disc uses 30% */ border-radius:999px;
  background: radial-gradient(circle at center, color-mix(in oklch,#fdf6ff,black 8%) 0 8%, #fdf6ff 9% 100%);
  box-shadow: inset 0 1px 2px rgba(0,0,0,.15);
}
```

**Where it spins:** `.icon-disc` (header brand mark, 22px) spins 6s/rotation; `.home-disc .ring` (Home screen logo, 48px inside an 88px floating badge) spins 5s/rotation. `.song-disc` (song-card badge, straddling the top edge of small/medium/large song cards) and `.team-disc` (team list row, 40px) never spin — they're read as static identity badges, not as "currently playing" indicators.

**Team disc** — same groove + diagonal-split + white-ring-and-label treatment as `.song-disc`, but the two groove colors are the team's own color and a 25%-darkened version of it (`var(--td-color)` / `color-mix(in oklch, var(--td-color), black 25%)`) instead of primary/secondary, and the resting shadow is tinted to the team color too (`0 2px 0 0 color-mix(in oklch, var(--td-color), black 35%)`).

## Token (the diagonally-split action piece)

Distinct from the disc: the token is the **draggable/interactive** team-color piece (guessing card, steal token) plus its static team-badge variant. Where the disc's split is a subtle overlay tint on top of a groove, the token's split *is* its base color — a clean `conic-gradient(from 135deg, light-half 0-180deg, dark-half 180-360deg)`, no groove texture, rounded-square for the draggable variants, full circle for the static badge.

```css
.token{
  border-radius:999px; /* draggable variants use 1.4rem (rounded-square) instead */
  background: conic-gradient(from 135deg, var(--tk-light) 0deg 180deg, var(--tk-dark) 180deg 360deg);
}
/* --tk-light: color-mix(in oklch, <team color>, white 35%)
   --tk-dark:  color-mix(in oklch, <team color>, black 25%) */
```

Three variants, one shared visual language:
- **Static team badge** — circular, initials centered, used as team identity wherever a disc isn't the right fit (this maps to the real `Token.tsx`'s no-`type` branch).
- **Mystery card** (draggable) — rounded-square, a `?` badge in the corner, floats gently, represents the card waiting to be placed.
- **Steal token** (draggable) — rounded-square, a bolt badge in the corner, same float, represents an available steal action.

All three carry a hard press shadow tinted to the team's dark half, plus a `0 0 0 2px var(--card)` ring to separate them from whatever they're sitting on.

## Cards

`.card` is the one generic panel: `border-radius:1.1rem`, `border:2px solid var(--border)`, `box-shadow:0 6px 0 0 var(--border)`, frosted `backdrop-filter:blur(14px)` over `var(--card)`. Selected/active state swaps the border to `--primary` and the shadow to the tinted-primary version — see Shadow system.

**Song card** — three sizes, all sharing one recipe: a warm tinted gradient body (`linear-gradient(165deg, color-mix(in oklch, var(--primary), var(--background) 85%), var(--background) 50%)`), fully opaque (no glow, no see-through frosting), a gentle float animation, and a top accent bar (`linear-gradient(90deg, primary, secondary, accent)`) clipped to the card's rounded corners via a `.song-card-fx` wrapper layer so it never clips the disc badge that straddles the top edge on purpose.

| Size | Width | Shows |
|---|---|---|
| Small | 56px | Year only |
| Medium | ~128px | Disc badge (straddling top edge) + year + artist |
| Large | ~256px | Disc badge + year (gradient-text) + artist + title |

## Components (quick reference)

- **Buttons** — full-radius pill, hard press shadow (`btn-default`), collapses to flat + translateY on `:active`. Variants: default (primary fill), secondary, outline, ghost, destructive.
- **Badges / pills** — full-radius, small, bold uppercase-ish label. Selector pills (genre/rules toggles) get a `.selected` state: primary border + tinted primary background, no shadow (list-item rule).
- **Inputs** — `radius-lg`, 2px border, tinted `--input` background.
- **Checkbox** — squared up to `.6rem` radius (was the one leftover sharp shadcn default), checked state = primary fill + a *soft ring* (`box-shadow:0 0 0 4px color-mix(...,transparent 80%)`) — this is the one intentional exception to "no glow," used only as a focus/checked ring, not a drop shadow.
- **Switch** — pill track, white thumb, hard shadow when off, primary-tinted hard shadow when on.
- **Radio options** — flat at rest, primary border + tinted background when `.selected`, no shadow (list-item rule).
- **Stepper** — circular +/- buttons flanking a numeric input, used for song/round counts.

## Dialogs

One dialog language, reused for both dialogs in the app (Edit team, Game settings) — not a new box type, just the `.card` recipe (border, radius, frosted blur) centered over a dimmed scrim, with the same top gradient bar every hero surface (song card, QR panel, winner card) already carries, and the hard press shadow instead of a glow.

```css
.dialog{border-radius:1.6rem;border:2px solid color-mix(in oklch,var(--primary),transparent 70%);background:var(--popover);backdrop-filter:blur(14px);box-shadow:0 8px 0 0 var(--border);}
```

Structure, top to bottom: the gradient bar (`linear-gradient(90deg, primary, secondary, accent)`, same as `.song-card .bar`) along the top edge; a plain ghost close button in the top-right corner; a header row with a round icon badge (bordered circle, tinted to whichever color suits the dialog's purpose — secondary for Edit team, primary for Game settings — hard shadow, no glow) plus a bold title; the scrollable body; and a footer that breaks from the body as a distinct muted strip (`color-mix(in oklch, var(--muted), transparent 40%)`, border-top) holding Cancel (outline) and Save changes (default), right-aligned, in that order every time.

The body content is never dialog-specific markup — it reuses the exact same field components as everywhere else in the app:
- **Edit team** (`max-width:360px`, secondary-tinted icon) — a `.input` for the name, then a wrapped row of `.team-disc` swatches (one per available team color) as `.color-swatch-btn`s: unselected swatches sit at 88% scale and 40% opacity, the selected one is full scale and opacity with a ring (`0 0 0 3px var(--popover), 0 0 0 5px var(--ring)`).
- **Game settings** (`max-width:680px`, primary-tinted icon) — wide enough for two columns (`.dialog-cols`, `1fr 1fr`, stacks to one column under 560px). Each column is **one** `.card` (`.dialog-col`), not a stack of per-field cards: **Music configuration** holds the genre pills (from Selector pills) plus the Release-year-range, Songs-per-year and Music-playback fields, and **Gameplay rules** holds Cards-to-win and Final-round-rule — all flat inside their column, same box-unification rule as everywhere else ("a bordered panel is the only box a screen needs"). The individual field components (steppers, switch, radio dots) are pulled straight from the Setup-controls gallery, just without that gallery's own per-field card wrapper. Mid-game changes should look and behave identically to first-time setup.

## Screen-level patterns

- **Header** — every screen with a header uses the same left-aligned `.icon-disc` brand mark + title. Right side: plain ghost icon buttons for Settings and End/Leave (destructive-tinted hover on End), then the theme toggle as the one bordered circular control — it's the only always-visible control, so it gets its own visual weight.
- **Home** — hero-centered `.home-disc` logo (a bigger frame around the same `.icon-disc`/`.song-disc` groove-and-label face), gradient-text title, then stacked full-width action buttons over the `.app-bg` background.
- **Setup** — three grouped `.card`s (Music, Rules, Teams), not one card per field. Music playback simplifies to a single Spotify on/off switch (off falls back to QR-code play). Final round rule shows real radio dots instead of a hidden/disabled input. Team list items: drag handle, `.team-disc`, `.team-name`, edit, delete — new-team input has an inline add button.
- **Game** — three-column layout (Teams status | Scan-for-audio / Revealed song | Round actions), with a big drag-and-drop timeline strip above it holding `.token` pieces in timeline slots.
  - **Teams status** — active team gets the shadow + primary border + "now playing" tag; every other row is flat (border + tint only), per the box-unification rule.
  - **Scan for audio** — a songcard-styled QR panel (`--qr-color` tinted, defaults to primary or the current team's color), fixed cream/ink scan surface that never theme-tokenizes (must keep scanning reliably in both themes).
  - **Round actions** — deliberately plain: one primary action, three equal secondary tiles below, no extra motion (the timeline/tokens/cards already carry the game's energy).
- **Game — after reveal** (new state, same screen) — three things swap: the open timeline slot fills with the revealed card, the QR panel becomes the large song card + `.round-winner` call-out (or the "no one called it" empty state), and Round actions becomes "who called it right" (team-pick list reusing the disc+name treatment, plus a fix-the-database link and a primary "next round" button). Teams panel loses its mystery-card/steal-token corner badges — nothing left to place or steal this round.
- **End** — `.winner-card` hero: circular trophy badge, team disc + name, "won!" line, Back to Home button inside the card. Below it, the team summary list reuses the disc+name+counts row from the Teams panel but swaps the mini-timeline for the full big-timeline treatment (every card the team collected) and drops the action-token corner badge (nothing left to steal/reveal).

## Implementation status

**Done, live in the real app:**
- `--shadow-glow` and the whole `--glow` family removed from `globals.css`; every component that referenced them uses the hard-shadow recipe.
- Shared `Disc` primitive (`src/components/Disc.tsx`, props: size, spin, colorA/colorB, shadow, label) backs the header mark, Home logo, song-card badge, QR panel badge and — via the `TeamDisc` wrapper — every team identity instance (Teams status, "who called it right", Final standings, the winner card, Team list, the Edit Team color picker).
- `Token.tsx` rebuilt around the `conic-gradient` diagonal split for both the static badge and the draggable mystery-card/steal-token variants; reserved strictly for the two actionable pieces now, not team identity.
- `SongCard.tsx` and `QRCodeDisplay.tsx` redesigned to the opaque tinted-body + Disc-badge recipe; the medium song card shows the title.
- `AppBackground.tsx` (gradient + 5 floating icons) shared across Home, Setup, Game and End — previously only Home had it.
- Box-unification shadow fixes landed in `TeamsStatus.tsx`, `ActionsPanel.tsx`, `TeamList.tsx`, `TeamSummary.tsx`, `WinnerView.tsx`.
- Timeline rails (`GameplayTimeline.tsx`, the mini-timeline in `TeamsStatus.tsx`, the big-timeline row in `TeamSummary.tsx`) now tint to the relevant team's color.
- Dialogs: `dialog.tsx`/`EditTeamDialog.tsx`/`GameSettingsDialog.tsx` already carried the hard-shadow + gradient-bar + icon-badge treatment from the earlier shadow-system pass. `GameSettingsDialog.tsx` is now the two-column layout documented above — Music configuration and Gameplay rules as two `Card`s side by side (`sm:grid-cols-2`, dialog widened to `sm:max-w-2xl`), stacking to one column on small screens.

**Still using pre-redesign styling (not yet touched):** the smaller Setup selector components not covered above (`GenreSelector`, `MusicModeSelector`, `SongsPerYearSelector`, `StartTokenSelector`, `WinnerCardsSelector`, `YearRangeSelector`) — these weren't part of any explicit mockup pass, so they were left as-is rather than guessed at. `TimelineSlot.tsx`'s open-slot sizing also wasn't restructured to the mockup's bigger dashed-box treatment, to avoid touching drag-and-drop hit-testing without a clear spec. `StatusBar.tsx` is dead code (not imported anywhere) and was left alone.

**Verification:** `tsc --noEmit` and `eslint` both pass clean across `src/app`, `src/components`, `src/lib` as of the latest change. `next build` itself hasn't been run from this side (sandbox is missing the Linux SWC binary) — worth one more local `npm run build` to confirm.
