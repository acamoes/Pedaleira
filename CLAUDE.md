# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server (http://localhost:5173)
npm run build     # tsc (typecheck) + vite build → dist/
npm run preview   # serve the production build
npx tsc --noEmit  # typecheck only (faster than full build)
```

There is **no test runner and no linter configured**. `npm run build` is the gate: it
typechecks with strict TS (`noUnusedLocals`/`noUnusedParameters` are on, so dead
locals/params fail the build).

UI text and most code comments are in **Portuguese (pt-PT)** — match that when adding strings.

## Big picture

"Pedaleira" is a virtual guitar pedalboard. It is **100% local/offline**: no backend, no
AI calls, no API keys. (Earlier versions called the Anthropic API — that is fully removed;
don't reintroduce SDK/network dependencies.) The user assembles the pedals they own, wires them
with patch cables, sees on each pedal card what that pedal does to the sound, and gets a song's
tone approximated via a copy-paste prompt workflow. There is currently **no audio playback**
(a Web Audio "Play" and a combined chain-waveform strip were removed on purpose — the user wants
to rethink that; don't bring them back unprompted). Domain vocabulary lives in `CONTEXT.md`.

### State: one Zustand store is the source of truth
`src/store/usePedalboardStore.ts` holds everything (current setup, saved setups, theme, song
history, highlight state). Every mutating action calls a local `persist()` that writes
`currentSetup` + `savedSetups` to localStorage immediately — there is no separate save step.
`makeEmptySetup`/`migratePedal` run on init; `migratePedal` also backfills fields on
old persisted data and a one-time `BYPASS_MIGRATION_KEY` flag forces all pedals off once.
Canvas geometry constants (`CANVAS_H`, `PEDAL_W`, `PEDAL_H`) are exported from this store and
shared by the board.

### The signal chain is wired manually with patch cables
Pedals are positioned freely on a canvas (`Pedal.x`, `Pedal.y`) and **all owned pedals live on
the board** (there is no separate inventory). The chain is **not** derived from position — it is
an explicit graph of `Connection[]` (stored on `PedalboardSetup.connections`). A connection is a
cable `{ from, to }` between jacks identified by string: `'guitar'` (output), `'amp'` (input),
`'<pedalId>:out'`, `'<pedalId>:in'`. Invariant: **at most one cable per output jack and per
input jack** (enforced in `connectJacks`).

`src/utils/chain.ts` is the single source of truth: **`deriveChain(pedals, connections)`** walks
from `'guitar'` following out→in links (with a visited-set guard) until `'amp'` or a dead end,
returning the ordered pedals — the chain order is the *wiring* order. Everything that needs the
chain calls `deriveChain` (`Pedalboard.tsx`, `Sidebar.tsx`, the printable settings sheet `print/SettingsSheet.tsx`).
`connectedIds` derives the "in chain" set. New pedals start with no cables (disconnected).
`Pedal.enabled` is retained but is now just a **mirror of "is in the derived chain"**, kept in
sync by `syncEnabledPedals` after every connection mutation (source of truth = `connections`).

Interaction lives in `Pedalboard.tsx`: draggable jack handles (`data-jack`/`data-kind`) start a
cable via Pointer Events; drop onto another jack calls `connectJacks`; clicking a cable in
`CableConnections.tsx` calls `disconnectCable`; the card footswitch calls `disconnectPedal`.
`applyParsedTune` builds the `connections` for the chosen order (guitar→…→amp) and repositions
`x` only cosmetically. `withMigratedConnections` (run in `hydrateSetup` on load/import) rebuilds
cables from the legacy `enabled`+`x` model for setups saved before this feature.

### Amplifiers ("Amplificador" / "Amp ativo")
`PedalboardSetup.amps` is the user's amp inventory (seeded with their Fender Frontman 10G, Boss
Katana-Mini and Yamaha THR5 via `constants/seedAmps.ts`; `hydrateSetup` backfills them into older
setups that lack the field — an empty list is kept, the user may delete every amp) and
`activeAmpId` is the one the chain ends in (`''` when there are none) — the `'amp'` jack always
means the active amp (`activeAmpOf`), or the "Sem amplificador" box (`NoAmp`) when there is none. Amps have knobs/switches like pedals but no `EffectType` and no wave.
`components/board/amp/AmpCard.tsx` draws each `AmpLayout` faithfully to the real panel (control
order, colours) and exports `AMP_DIMS` — `Pedalboard.tsx` derives the amp jack from `w`/`jackY`,
so changing a layout's panel height means updating `jackY`. Unknown models become a `generic` amp.
Knob extras used by amps: `labels` (selectors, e.g. Katana AMP TYPE) and `zones` (THR5 Effect and
Delay/Reverb: one knob, 10 units per zone, 0 = off); always format values with
`utils/knobDisplay.ts`. The tune prompt lists the amps and asks the LLM to pick one;
`parseTuneAnswer` fills `response.amp`, which `applyParsedTune` makes active.

### Print sheet ("Ficha de regulação")
`components/print/SettingsSheet.tsx` renders a hidden, print-only A4-landscape sheet in a
technical-datasheet style (title block grid, numbered sections, uniform 4-column card grid, ruled
notes). It paginates itself — card/row heights are *estimated in mm* so every page repeats the
title block, and notes only use the space left on the last page (they never open a new page) —
so those constants must stay in sync with the `@media print` rules in `index.css`. Verify changes by printing to PDF (headless Chrome `--print-to-pdf`).

### Pedal wave ("Onda do pedal") — keyed off `EffectType`
`src/utils/signal.ts` is pure-math DSP for **visualization only** (`pedalWave` picks a view per
type — waveform close-up, note over time, or frequency response — driven by knobs and Type/Mode
selectors), rendered per pedal by `WaveformViz` inside `PedalCard`. Each card shows its pedal **in isolation**
(clean input → that pedal), never the accumulated chain.

**Adding a new `EffectType` is cross-cutting**: update the union in `src/types/index.ts`, then
`signal.ts` (`pedalWave`), `PedalCard` `TYPE_LABELS`, `WaveformViz` `TYPE_DESC`,
`constants/knobInfo.ts`, and `utils/chainWarnings.ts` ordering.

### Pedal identification (no AI)
`src/constants/seedPedals.ts` is a local database keyed by normalized name (hyphen/space/case
insensitive via `findSeedPedal`); `SEED_PEDAL_LIST` is the deduped dropdown list. Unknown names
fall back to a generic editable pedal (`useIdentifyPedal.ts`). Seed entries may carry a default
`color`.

### Song-tuning is a manual prompt/answer round-trip (`src/utils/tunePrompt.ts`)
`buildTunePrompt` generates text asking an external LLM to pick a chain + knob values using
*only* the owned pedals. The user pastes the reply back; `parseTuneAnswer` is a tolerant
heuristic parser that accepts **either** a JSON block **or** free text (order line with arrows +
a per-pedal table), matches pedal names fuzzily, extracts knob values (named or positional),
and detects bypass. It returns a `TunePedalsResponse` + ordered ids consumed by
`applyParsedTune`. When changing the prompt wording, keep the parser's expectations in sync.

### Rendering / aesthetic
Hand-drawn black/white "sketch" look. Theming uses CSS custom properties in `src/index.css`
(`--color-ink`, `--color-paper`, ...); `tailwind.config.ts` colors reference those vars and dark
mode swaps them via the `.dark` class on `<html>` (toggled in `App.tsx` from store `theme`).
SVG illustrations (`PedalCard`, knobs) use `currentColor` +
`var(--color-*)` so they theme automatically — avoid hardcoded hex in SVGs (exceptions: pedal body
colours and the amp layouts, which copy real hardware colours). The guitar is a fixed CC0
Stratocaster illustration (`src/assets/stratocaster.svg`, cleaned from Open Clip Art) inside
`GuitarBox`; its output jack comes from `GUITAR_BOX.jackY`, not from the drawing. When editing complex SVG illustrations, render to PNG and look at the
result rather than guessing bezier coordinates.
