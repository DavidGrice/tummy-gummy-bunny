# Mobile Responsiveness TODO

**Status:** Pending  
**Viewport targets:** 375px (iPhone SE) · 390px (iPhone 14 Pro) · 768px (tablet)

---

## ✅ Already Done

- `input, textarea, select { font-size: 16px }` in globals.css — prevents iOS auto-zoom
- `min-h-[44px]` on BackButton — meets Apple/Google touch target HIG
- `MenuButton` uses `py-4` (≥44px total height) — meets touch target
- `overflow-x-hidden` on PageShell and auth page — no horizontal scroll
- Auth card uses `mx-4` — safe padding on narrow screens

---

## 🔲 Auth Page

- [ ] Test card at 375px — verify `max-w-md` doesn't cause side clipping
- [ ] Verify `px-8 md:px-12` padding feels right at 375px (may need `px-6 sm:px-8`)
- [ ] Logo circle + title stack cleanly at narrow widths
- [ ] Input hint text (allowed chars list) — check for wrapping at 320px

---

## 🔲 Welcome Page

- [ ] `MenuButton` description text — check wrap at 375px
- [ ] `space-y-3` gap between buttons — feels right on mobile?
- [ ] Title "TUMMY GUMMY BUNNY" — test `text-3xl md:text-4xl` at 375px
- [ ] Add `px-4` horizontal padding guard on the welcome content wrapper

---

## 🔲 Start / Options / Extras Sub-Pages

- [ ] Start page buttons — same MenuButton audit as Welcome
- [ ] Options page toggle rows — verify `flex items-center justify-between` at 320px
- [ ] Options toggle switch — `w-12 h-6` knob is fine; ensure row `py-4` gives full 44px tap height
- [ ] Extras grid — currently `grid-cols-1 sm:grid-cols-2 md:grid-cols-3` — verify 1-col at 375px
- [ ] Extras card height — consistent at 1-col layout?

---

## 🔲 Credits Page

- [ ] Test scroll speed on mobile (38s — may feel too slow/fast on touch)
- [ ] Pause hint text visibility on small screens
- [ ] `py-[100vh]` padding on credits content — verify doesn't cause memory issues on low-end devices
- [ ] "← Return to menu" link tap target at bottom

---

## 🔲 Game Canvas (Touch / Mobile)

- [ ] **Touch-action**: add `touch-action: none` on the canvas element so touch drags don't scroll the page while playing
- [ ] **Tap vs drag**: `InputManager` uses `pointerdown` which fires on tap — but a swipe also fires it. Track `pointermove` delta and suppress click if pointer moved more than ~8px between down and up
- [ ] **Multi-touch**: prevent pinch-to-zoom triggering movement — listen for `e.touches.length > 1` and bail early
- [ ] **Hover on mobile**: `OutlinePass` highlights are driven by `pointermove` which doesn't fire on touch screens. On mobile, the outline should appear on tap (object is already selected when the click fires, so this is a no-op for now)
- [ ] **iOS Safari pointer events**: Pointer Events API is complete on iOS 13+ but gesture behaviour (pan, zoom) can interfere — test on physical device

---

## 🔲 Global

- [ ] Audit all `text-xs` labels — ensure readable at default mobile font scale
- [ ] Safe-area insets — add `pb-safe` / `pt-safe` if deploying as PWA
- [ ] Test landscape orientation on mobile (all pages)
- [ ] Add `viewport` meta with `width=device-width, initial-scale=1` (should be set by Next.js by default — verify)
- [ ] Verify Tailwind purge keeps all responsive `sm:` / `md:` / `lg:` classes

---

_Update this file as items are resolved. Add new items as they're discovered during device testing._
