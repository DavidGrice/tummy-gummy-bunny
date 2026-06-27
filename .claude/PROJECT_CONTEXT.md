# Tummy Gummy Bunny — Project Context

> Hand this file to any LLM working on this project. It covers everything built so far,
> the architecture, the patterns in use, and what still needs doing.

---

## What This Is

A **point-and-click adventure game** built with Next.js 15 + Three.js r177.
The player controls Mr. Bunny (a capsule-geometry bunny) by clicking the floor to walk
and clicking labelled objects to interact. It ships to Vercel as a web app.

**Live stack:**
- Next.js 15.5 (App Router, `"use client"` where needed)
- Three.js r177
- Tailwind CSS v4
- TypeScript strict
- Vercel deployment (main branch auto-deploys)

**GitHub:** david grice — see `git remote -v` for the repo URL.

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
- `/play` and `/play/*` → requires auth, else `/auth`

The game canvas lives at **`/play`** — do NOT move it back to `/`.

---

## Visual Design System

### Theme

Summer-evening gradient background (defined in `config/theme.config.ts`):
```
linear-gradient(to bottom, sandy 0%, coral 40%, ember 70%, char 100%)
```
Applied globally — all pages show this gradient as the page background.

### Color palette (`tailwind.config.ts` + `app/globals.css`)

| Name | Hex | Usage |
|------|-----|-------|
| `summer-sandy` | `#F4923A` | Accent, warm mid-tone |
| `summer-coral` | `#BF3F1E` | Primary CTA, buttons, highlights |
| `summer-ember` | `#7A1E0A` | Deep accent |
| `summer-char` | `#1A0800` | Dark background |
| `summer-cream` | `#FFF5E6` | Primary text on dark |
| `summer-peach` | `#F5CBA7` | Secondary text |
| `summer-gold` | `#FFCF47` | Hover/outline accent |
| `summer-error` | `#E53E3E` | Form validation |

### Glassmorphic Card Style (USER LOVES THIS — preserve everywhere)

**Standard nav card (max-w-md):**
```
rounded-3xl bg-gray-900/60 backdrop-blur-md border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-8 py-10
```

**Game overlay / modal card (max-w-sm, slightly more opaque):**
```
rounded-3xl bg-gray-900/70 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-8 py-10
```

**Wide card (extras/credits, max-w-xl):**
```
rounded-3xl bg-gray-900/60 backdrop-blur-md border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]
```

### Button / Touch targets

- All interactive elements minimum `min-h-[44px]` (Apple HIG)
- Primary CTA: `bg-summer-coral text-white font-black uppercase tracking-widest rounded-2xl`
- Disabled: `bg-white/8 text-white/20 cursor-not-allowed`

---

## App Pages

| Route | File | Notes |
|-------|------|-------|
| `/` | `app/page.tsx` | Middleware always redirects away; never renders |
| `/auth` | `app/auth/page.tsx` | Username entry, cookie set on submit |
| `/welcome` | `app/welcome/page.tsx` | Main menu with 4 MenuButtons |
| `/welcome/start` | `app/welcome/start/page.tsx` | Tutorial / New Game / Continue (disabled) |
| `/welcome/options` | `app/welcome/options/page.tsx` | Toggle switches (sound, music, tutorial hints) |
| `/welcome/extras` | `app/welcome/extras/page.tsx` | Gallery grid placeholder |
| `/welcome/credits` | `app/welcome/credits/page.tsx` | Cinematic auto-scroll with glass backdrop |
| `/play` | `app/play/page.tsx` | Game canvas — loads `GameCanvasLoader` |

---

## UI Components

```
components/
  ui/
    auth/
      AuthCard.tsx        — white card with 3D depth shadow (bg-white shadow-card-3d)
      AuthForm.tsx        — form wrapper, dark text on white
      UsernameInput.tsx   — input with validation states, font-size 16px (no iOS zoom)
    nav/
      PageShell.tsx       — wraps every nav page, ambient blobs, overflow-x-hidden
      BackButton.tsx      — 44px touch target
      MenuButton.tsx      — large nav tile with icon + label + description
  game/
    GameCanvasLoader.tsx  — dynamic(ssr:false) wrapper for GameCanvas
    GameCanvas.tsx        — mounts the canvas ref, renders game UI overlays
    LoadingScreen.tsx     — 🐰 bounce + progress bar, 700ms minimum display
    TutorialOverlay.tsx   — stepped 3-page onboarding card (Move→Interact→Patience)
    DialogBox.tsx         — centered speech bubble (absolute inset-0 flex items-center)
```

### TutorialOverlay flow
- 3 steps: **Moving** (🐾) → **Interacting** (✨) → **Patience** (⏳)
- Each step locks the Next button for **3 seconds**, showing a `3→2→1` countdown
- "Do not show again" checkbox + "Got it!" only appear on step 3
- Controlled by `localStorage.tgb_tutorial_seen` flag
- Backdrop `bg-black/40` blocks all game clicks while visible

### DialogBox
- Centered on screen (`absolute inset-0 z-40 flex items-center justify-center`)
- Glass card `bg-gray-900/92 backdrop-blur-md`, 🐰 icon, message text, OK button

---

## Game Engine Architecture

All engine code lives under `engine/`. It is **framework-agnostic** (no React imports).

```
engine/
  core/
    Camera.ts         — THREE.PerspectiveCamera wrapper, resize()
    Loop.ts           — requestAnimationFrame loop, add(fn)/stop()/start()
    Renderer.ts       — THREE.WebGLRenderer + EffectComposer post-processing
    SceneManager.ts   — loads/unloads BaseScene, calls update() each frame
  input/
    InputManager.ts   — pointermove → onHover(), pointerdown → onClick()
  interaction/
    Raycaster.ts      — castFirst(pointer, camera, targets) → Intersection|null
  objects/
    LabelSprite.ts    — floating pill label (CanvasTexture sprite), hover color swap
    InteractableObject.ts — mesh + label + onInteract, setHovered() passthrough
  characters/
    Character.ts      — abstract base: walkTo(target, onArrival?), isMoving gate
```

### Renderer (post-processing pipeline)

`Renderer.ts` runs a full EffectComposer after `renderer.setup()` is called:
1. `RenderPass` — renders scene normally
2. `OutlinePass` — gold outline (`#FFCF47`) on hovered interactables, sandy hidden edge (`#F4923A`)
3. `OutputPass` — linear→sRGB color space conversion

`renderer.setup(scene, camera, width, height)` must be called **after** scene loads.
`renderer.setHoveredObjects(objects[])` drives the outline.

### InputManager

- `onClick(handler)` — fires on `pointerdown` with normalized NDC coords
- `onHover(handler)` — fires on every `pointermove` with NDC coords
- Both use Pointer Events API (works for touch tap too, mobile future work)
- `dispose()` removes all listeners, clears all handler sets

### LabelSprite

- Bakes **two** CanvasTextures at construction: normal (dark pill `rgba(20,10,0,0.82)`, cream text) and hovered (same dark color fully opaque `rgba(20,10,0,1.0)`, white text)
- `setHovered(boolean)` swaps `material.map` — no per-frame redraws
- `sprite.raycast = () => undefined` — excluded from raycaster so clicks go to the mesh
- Uses `arcTo` path for pill shape (NOT `roundRect` — browser compat issue)
- `depthTest: false` so label always renders on top of geometry

### InteractableObject

- Wraps a `THREE.Mesh` + `LabelSprite`
- Sets `mesh.userData.interactable = true` and `mesh.userData.onInteract`
- `setHovered(boolean)` passes through to `LabelSprite`
- Compound objects (e.g., door with frame/panel/knob children): raycaster may hit a child mesh, caller walks up via `.parent` until `userData.interactable` is found

---

## Scene Architecture

```
scenes/
  BaseScene.ts         — abstract: setup(), update(), dispose(), getCastTargets(),
                         handleClick(), setupCamera?(), onHoverChange?()
  tutorial/
    TutorialScene.ts   — Mr. Bunny's bedroom
    data/
      layout.ts        — ROOM, BOUNDS, BUNNY_START, OBJECTS, WINDOWS constants
      interactions.ts  — dialog strings for each interactable
    objects/
      Floor.ts         — PlaneGeometry, userData.isFloor = true
      Walls.ts         — north/east/west solid walls + south door-frame panels (transparent)
      Wardrobe.ts      — InteractableObject factory
      Dresser.ts       — InteractableObject factory (with mirror child mesh)
      RoomDoor.ts      — InteractableObject factory (frame + panel + knob children)
      Bed.ts           — InteractableObject factory (frame + mattress + pillow)
      Windows.ts       — THREE.Group[] factory (decorative, NOT interactable)
```

### TutorialScene room layout

Camera: position `(0, 8, 8)` looking at `(0, 0, 0)` — top-down isometric angle.
Room: 8×8 units, walls at x=±4 and z=±4. Floor at y=0.

| Object | Position (x,y,z) | Size (w,h,d) | Notes |
|--------|-----------------|--------------|-------|
| Wardrobe | -3.65, 0, 0 | 0.5, 2.2, 1.2 | Left (west) wall, face along Z |
| Dresser | 0, 0, -3.65 | 1.6, 1.0, 0.5 | North wall, under windows |
| Door | 0, 0, 3.5 | 0.9, 2.2, 0.15 | South wall, interactable |
| Bed | 3.4, 0, -0.5 | 1.0, 0.5, 2.2 | Right (east) wall, laid along Z |
| Windows | ±1.0, 1.75, -3.9 | — | North wall, decorative, sky-blue glass |

Walkable BOUNDS: x and z clamped to `[-3.0, 3.0]`.

South wall: three BoxGeometry panels at `z = doorZ - wallThick = 3.3` (left, right, lintel),
`opacity: 0.7`, framing the door opening. NOT a single plane — avoids z-sorting in front of door.

### Click / hover flow

```
useGame (pointermove) → InputManager.onHover
  → Raycaster.castFirst (interactable targets only, floor excluded)
  → walk .parent chain until userData.interactable
  → renderer.setHoveredObjects([obj])    ← OutlinePass gold glow
  → scene.onHoverChange(obj)             ← LabelSprite pill darkens
  → canvas.style.cursor = "pointer"

useGame (pointerdown) → InputManager.onClick
  → Raycaster.castFirst (all targets incl. floor)
  → scene.handleClick(hit)

TutorialScene.handleClick(hit):
  → isFloor → mrBunny.walkTo(clamped point)
  → isInteractable → mrBunny.walkTo(standPos 1 unit toward center, onArrival: onInteract())
```

### MrBunny

- Extends `Character` (abstract), speed = 3
- Geometry: `CapsuleGeometry(0.25, 0.5)` body cream `0xF0E0C8`, ear children
- `walkTo(target, onArrival?)` — sets `isMoving = true`, lerps toward target each frame
- `isMoving` blocks all new movement and click-handling until arrival
- Starts at `BUNNY_START = [0, 1]` → world position `(0, 0.5, 1)`

---

## The `useGame` Hook

`hooks/useGame.ts` is the single React bridge to the engine. It:

1. Creates: `SceneManager`, `Camera`, `Renderer`, `InputManager`, `Raycaster`, `Loop`
2. Loads scene async (with try/catch — **no unhandled rejections**)
3. Calls `renderer.setup()` after scene load
4. Registers hover + click handlers (hover only after loading completes)
5. Starts game loop (`loop.start()`)
6. Exposes: `{ isLoading, loadProgress, dialog, dismissDialog }`
7. Cleans up everything (including `canvas.style.cursor`) on unmount

The 700ms minimum loading delay ensures the loading screen is visible even on fast loads.

---

## Known Issues / To-Do

### Engine
- [ ] **Mobile touch**: `InputManager` uses Pointer Events (works for tap) but needs:
  - `touch-action: none` on canvas to prevent scroll while playing
  - Tap vs drag distinction (suppress click if pointer moved >8px between down/up)
  - Multi-touch prevention
  - See `styles/MOBILE_TODO.md` for full list
- [ ] **Hover on mobile**: `OutlinePass` highlights won't show (no pointermove on touch) — plan is tap-selects-and-highlights
- [ ] Future scenes need to be added to `SceneManager` scene registry

### Game Content
- [ ] All 4 room objects have placeholder dialog only
- [ ] No save system yet (Continue is disabled in the start menu)
- [ ] Extras page is a placeholder gallery grid
- [ ] No audio implemented (toggles exist in Options but are wired to localStorage only)

### UI / Polish
- [ ] Full mobile responsive audit pending (`styles/MOBILE_TODO.md`)
- [ ] No game pause / escape menu
- [ ] No transitions between scenes

---

## Key Patterns to Preserve

1. **Glass cards**: `bg-gray-900/[60|70]/92 backdrop-blur-md border border-white/[8|10]` — user loves this, use on ALL card/panel UI
2. **arcTo pill** in `LabelSprite.buildTexture()` — do NOT use `ctx.roundRect()` (not available in all browsers)
3. **`ssr: false`** on `GameCanvasLoader` — Three.js must never run server-side
4. **`scene.onHoverChange?.()` + `renderer.setHoveredObjects()`** — both must fire on hover (labels + outline)
5. **`isMoving` gate** in Character — never remove this; clicking during a walk is intentionally a no-op
6. **Hierarchy traversal** in handleClick: always walk `.parent` until `userData.interactable` — compound objects (door, bed) have child meshes that get hit first
7. **try/catch on async IIFE** in useGame — prevents `[object Event]` unhandled rejection in Next.js devtools
8. **Commit + push after every meaningful change** — user's workflow requires Vercel auto-deploy

---

## File Naming Conventions

- Engine classes: `PascalCase.ts`
- Scene factories: `create{Name}.ts` returning `InteractableObject` or `THREE.Mesh[]`
- React components: `PascalCase.tsx` with named exports
- Data files: `camelCase.ts` exporting `const` objects
- Hooks: `use{Name}.ts`

---

## Git

Branch: `main` (auto-deploys to Vercel on push)
Always commit with descriptive messages and push immediately after.
Last commit as of this writing: room redesign (bed, windows, wardrobe/dresser moved).
