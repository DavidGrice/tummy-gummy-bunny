# Tummy Gummy Bunny — Project Context

> Hand this file to any LLM working on this project. It covers everything built so far,
> the architecture, the patterns in use, and what still needs doing.
> Last updated: 2026-06-27

---

## What This Is

A **point-and-click adventure game** built with Next.js 15 + Three.js r177.
The player controls a bunny (named after the logged-in user) by clicking the floor to walk
and clicking labelled objects to interact. It ships to Vercel as a web app.

**Live stack:**
- Next.js 15.5 (App Router, `"use client"` where needed)
- Three.js r177
- Tailwind CSS v4
- TypeScript strict
- Vercel deployment (main branch auto-deploys)

---

## Auth & Routing

Authentication is cookie-based (no passwords — just a username).

| Cookie | Key |
|--------|-----|
| Username | `tgb_username` |

`middleware.ts` enforces:
- `/` → redirects to `/welcome` (authed) or `/auth` (not authed)
- `/auth` → redirects to `/welcome` if already authed
- `/welcome/*` → requires auth, else `/auth`
- `/play` → requires auth, else `/auth`

`lib/cookies.ts` has `getUsername()`, `setUsername()`, `clearUsername()` — safe to call in client components.

The game canvas lives at **`/play`**.

---

## Visual Design System

### Theme

Summer-evening gradient background (`config/theme.config.ts`):
```
linear-gradient(to bottom, sandy 0%, coral 40%, ember 70%, char 100%)
```

### Color palette

| Name | Hex | Usage |
|------|-----|-------|
| `summer-sandy` | `#F4923A` | Accent, warm mid-tone |
| `summer-coral` | `#BF3F1E` | Primary CTA, active states |
| `summer-ember` | `#7A1E0A` | Deep accent |
| `summer-char` | `#1A0800` | Dark background |
| `summer-cream` | `#FFF5E6` | Primary text on dark |
| `summer-peach` | `#F5CBA7` | Secondary text |
| `summer-gold` | `#FFCF47` | Hover outline accent |
| `summer-error` | `#E53E3E` | Validation errors |

### Glassmorphic Card Style (USER LOVES THIS — preserve everywhere)

**Standard nav card (max-w-md):**
```
rounded-3xl bg-gray-900/60 backdrop-blur-md border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-8 py-10
```

**Game overlay / modal card (max-w-sm):**
```
rounded-3xl bg-gray-900/70 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-8 py-10
```

**Right-side drawer (wardrobe/dresser/journal panels):**
```
absolute right-0 top-0 bottom-0 w-[45%] min-w-[260px] bg-gray-900/90 backdrop-blur-md border-l border-white/10
```

---

## App Pages

| Route | File | Notes |
|-------|------|-------|
| `/auth` | `app/auth/page.tsx` | Username entry, cookie set on submit |
| `/welcome` | `app/welcome/page.tsx` | Main menu |
| `/welcome/start` | `app/welcome/start/page.tsx` | Tutorial / New Game / Continue |
| `/welcome/options` | `app/welcome/options/page.tsx` | Sound/music/tutorial toggles |
| `/welcome/extras` | `app/welcome/extras/page.tsx` | Gallery placeholder |
| `/welcome/credits` | `app/welcome/credits/page.tsx` | Cinematic auto-scroll |
| `/play` | `app/play/page.tsx` | Game canvas |

---

## UI Components

```
components/
  ui/
    auth/AuthCard.tsx, AuthForm.tsx, UsernameInput.tsx
    nav/PageShell.tsx, BackButton.tsx, MenuButton.tsx
  game/
    GameCanvasLoader.tsx  — dynamic(ssr:false) wrapper
    GameCanvas.tsx        — canvas ref, all game overlays, syncs equipped→MrBunny
    LoadingScreen.tsx     — 🐰 bounce + progress, shows playerName
    TutorialOverlay.tsx   — 3-step onboarding (playerName in step text)
    DialogBox.tsx         — centered glass speech bubble
    InventoryPanel.tsx    — right-side drawer: 3D preview canvas + item grid (equip/unequip)
    InventoryHUD.tsx      — 🎒 FAB + tabbed modal (READ-ONLY — visit furniture to change)
```

### InventoryPanel (wardrobe/dresser)
- Right-side drawer layout (left half shows dim game, right half = panel)
- Top: live 3D `PreviewBunny` rendered in a small `<canvas>` via `usePreviewRenderer`
- Bottom: item grid with equip/unequip (this IS the source panel, so it's interactive)
- Source "wardrobe" shows only outerwear tab; "dresser" shows Tops + Bottoms tabs

### InventoryHUD (🎒 FAB)
- Always visible during gameplay (bottom-right corner)
- Opens a tabbed modal: All | Outerwear | Tops | Bottoms
- **Read-only** — items show "On" label if equipped, source location hint if not
- Clicking items does nothing — player must visit wardrobe/dresser to change

---

## Inventory System

**`lib/inventory.ts`** — canonical source:
- `InventoryItem`: `{ id, name, emoji, category, colorHex }`
- `ItemCategory`: `"top" | "bottom" | "outerwear"`
- `EquippedClothing`: `{ outerwear, top, bottom }` — shared by engine + hooks
- `WARDROBE_ITEMS`: 4 outerwear items (🧥 Raincoat, 🥼 Long Coat, 🎽 Hoodie, 🧣 Scarf)
- `DRESSER_ITEMS`: 6 items — 3 tops (👕 T-Shirt, 🦺 Vest, 👔 Button-Up), 3 bottoms (👖 Jeans, 🩳 Shorts, 👗 Sundress)

**`hooks/useInventory.ts`** — React state: `equipped`, `equip(item)`, `unequip(category)`

---

## Game Engine Architecture

```
engine/
  core/
    Camera.ts       — PerspectiveCamera wrapper, resize()
    Loop.ts         — rAF loop, add(fn)/stop()/start()
    Renderer.ts     — WebGLRenderer + EffectComposer (RenderPass→OutlinePass→OutputPass)
    SceneManager.ts — loads/unloads BaseScene, update() each frame
  input/
    InputManager.ts — pointermove→onHover(), pointerdown→onClick()
  interaction/
    Raycaster.ts    — castFirst(pointer, camera, targets)
  objects/
    LabelSprite.ts        — floating pill label, dual CanvasTexture hover swap
    InteractableObject.ts — mesh + label + onInteract, setHovered() passthrough
  characters/
    Character.ts       — abstract base: walkTo(), isMoving gate, update()
    ClothingLayers.ts  — SHARED utility: buildClothingLayers(body), applyEquipped(layers, equipped)
    PreviewBunny.ts    — dressing room preview bunny (auto-spin, setEquipped, eyes/nose)
```

### ClothingLayers (shared between MrBunny + PreviewBunny)
`buildClothingLayers(body)` attaches 3 invisible Box mesh children to the body mesh:
- Outerwear: `BoxGeometry(0.58, 0.92, 0.58)` at local y=-0.02
- Top: `BoxGeometry(0.56, 0.40, 0.56)` at local y=+0.08
- Bottom: `BoxGeometry(0.52, 0.38, 0.52)` at local y=-0.24
- All use `polygonOffset` to prevent z-fighting with the capsule

`applyEquipped(layers, equipped)` sets visibility + `colorHex` on each layer.

### usePreviewRenderer hook
- Creates an independent `WebGLRenderer` pointing at the panel's small `<canvas>`
- Warm dual lighting (sun + cool fill), transparent background
- `ResizeObserver` keeps pixel dimensions correct
- Second `useEffect` pushes `equipped` changes to the bunny without remounting

---

## Characters

### MrBunny (`characters/MrBunny.ts`)
- Extends `Character`, speed = 3
- `CapsuleGeometry(0.25, 0.5)` cream body with ears + inner ears
- **Clothing layers** via `buildClothingLayers` (from `ClothingLayers.ts`)
- **Walking animation** (override `update()`):
  - `Math.max(0, sin(time × 6π))` → clean periodic hops at 6 Hz
  - Squash-and-stretch: scaleY up at hop peak, scaleXZ slightly in
  - On arrival: emphatic landing squash `(1.14, 0.86, 1.14)` → spring back at 14× delta
- **`setEquipped(equipped)`** → calls `applyEquipped(this.clothing, equipped)`
- Driven from `GameCanvas` via `useEffect` watching `equipped` → `pushEquippedToGame(equipped)`

### PreviewBunny (`engine/characters/PreviewBunny.ts`)
- Same body + ears + clothing layers as MrBunny
- Also has eyes (SphereGeometry 0.045) and nose (SphereGeometry 0.03) — visible at close range
- Auto-spins: `group.rotation.y += delta * 0.55`
- `setEquipped()` uses same shared `applyEquipped`

---

## Scene Architecture

```
scenes/
  BaseScene.ts       — abstract: setup(), update(), dispose(), getCastTargets(),
                       handleClick(), setupCamera?(), onHoverChange?()
  tutorial/
    TutorialScene.ts
    data/
      layout.ts        — ROOM, BOUNDS, BUNNY_START, OBJECTS, WINDOWS
      interactions.ts  — dialog + inventory callbacks; takes playerName
    objects/
      Floor.ts, Walls.ts, Wardrobe.ts, Dresser.ts, RoomDoor.ts, Bed.ts, Windows.ts
```

### TutorialScene room layout

Camera: `(0, 8, 8)` looking at `(0, 0, 0)`. Room: 8×8 units.

| Object | Position (x,y,z) | Size (w,h,d) | Interaction |
|--------|-----------------|--------------|-------------|
| Wardrobe | -3.65, 0, 0 | 0.5, 2.2, 1.2 | Opens wardrobe inventory panel |
| Dresser | 0, 0, -3.65 | 1.6, 1.0, 0.5 | Opens dresser inventory panel |
| Door | 0, 0, 3.5 | 0.9, 2.2, 0.15 | Dialog: almost ready |
| Bed | 3.4, 0, -0.5 | 1.0, 0.5, 2.2 | Dialog: {playerName} yawns |
| Windows | ±1.0, 1.75, -3.9 | — | Decorative only |

South wall: 3 BoxGeometry panels (left, right, lintel) at z=3.3, opacity 0.7. No z-sorting issue.

### TutorialScene callbacks
- `onProgress(fn)` — loading %
- `onDialog(fn)` — sets dialog string in useGame
- `onInventory(fn)` — sets inventorySource ("wardrobe" | "dresser") in useGame
- `setPlayerName(name)` — stored before setup(), passed to createInteractions()
- `setCharacterEquipped(equipped)` — delegates to `mrBunny.setEquipped(equipped)`

---

## The `useGame` Hook

`hooks/useGame.ts` — React bridge to engine. Returns:
- `{ isLoading, loadProgress, dialog, dismissDialog, inventorySource, dismissInventory, setEquipped }`
- `setEquipped` is a stable `useCallback` that reads `sceneRef.current` at call time
- `sceneRef` is set to the TutorialScene instance inside the effect, cleared on unmount

---

## Player Name Personalisation

`GameCanvas` calls `getUsername() ?? "Bunny"` and passes `playerName` to:
- `useGame(canvasRef, playerName)` → `scene.setPlayerName()` → `createInteractions()`
- `<LoadingScreen playerName={playerName} />` — "Loading {name}'s Room…"
- `<TutorialOverlay playerName={playerName} />` — all 3 step bodies use the name
- Bed dialog: "{playerName} yawns…"

---

## Known Issues / To-Do

### Upcoming Features (in order)
- [ ] **Journal / Quest Diary** — interactable in room, split-panel notebook UI (lined paper CSS, Caveat font, quest list left + content right)
- [ ] **Write your own journal entry** — FUTURE (after journal). "New Entry" button, freeform text, persists in localStorage as `tgb_journal_{username}`. Quest type discriminated union: `"quest" | "personal"`.
- [ ] **Scene transition** — door leads to a second room; needs SceneManager registry + fade transition
- [ ] **Mobile touch pass** — see `styles/MOBILE_TODO.md`
- [ ] **Audio** — toggles wired to localStorage, no sound yet
- [ ] **Save system** — Continue is disabled; no persistence beyond username + tutorial flag + journal

### Engine
- [ ] Hover on mobile: OutlinePass requires pointermove; plan is tap-selects-and-highlights
- [ ] Future scenes need SceneManager scene registry

### Game Content
- [ ] All room interactions have placeholder dialog (door, bed)
- [ ] Extras page is a placeholder gallery

### Player Customisation (planned — do not implement yet)
- [ ] **Room personalisation** — bed colour, wall colour, floor colour per room should eventually be driven by player preferences rather than hardcoded manifest values. Bed colours are currently placeholder neutrals (tutorial: sage green `0x5C8A50`, sibling: ocean blue `0x4A7BA8`).
- [ ] **Character appearance** — bunny fur colour, eye colour, and default outfit selection to be added as a character-creation / options step.
- [ ] Hook into the existing `tgb_username` cookie flow: store preferences in `localStorage` keyed by username (`tgb_prefs_{username}`), load on `/play` boot, apply to manifest overrides before scene setup.

---

## Key Patterns to Preserve

1. **Glass cards**: `bg-gray-900/[60|70|90] backdrop-blur-md border border-white/[8|10]` — on ALL card/panel UI
2. **arcTo pill** in `LabelSprite.buildTexture()` — do NOT use `ctx.roundRect()` (browser compat)
3. **`ssr: false`** on `GameCanvasLoader` — Three.js must never run server-side
4. **`scene.onHoverChange?.()` + `renderer.setHoveredObjects()`** — both must fire on hover
5. **`isMoving` gate** in Character — clicking during a walk is intentionally a no-op
6. **Hierarchy traversal** in handleClick — walk `.parent` until `userData.interactable`
7. **try/catch on async IIFE** in useGame — prevents unhandled rejection errors
8. **Commit + push after every meaningful change** — Vercel auto-deploys on push
9. **`EquippedClothing` from `lib/inventory.ts`** — canonical shared type; `EquippedItems` in `useInventory.ts` is just a re-export alias
10. **`ClothingLayers.ts`** — always use the shared utility for clothing meshes; never duplicate the geometry values in PreviewBunny or MrBunny directly
11. **`setEquipped` is imperative** — it uses `sceneRef.current` at call time; do not put it in a state-driven effect that re-creates the engine
12. **Inventory HUD is read-only** — the FAB modal shows status only; equip/unequip only happens in the wardrobe/dresser panels

---

## File Naming Conventions

- Engine classes: `PascalCase.ts`
- Scene factories: `create{Name}.ts`
- React components: `PascalCase.tsx` with named exports
- Data files: `camelCase.ts`
- Hooks: `use{Name}.ts`

---

## Git

Branch: `main` (auto-deploys to Vercel)
Always commit with descriptive messages and push immediately after each feature.
