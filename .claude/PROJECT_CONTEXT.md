# Tummy Gummy Bunny — Project Context

> Hand this file to any LLM working on this project. It covers everything built so far,
> the architecture, the patterns in use, and what still needs doing.
> Last updated: 2026-06-30

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

## GLB Model Registry

**`models/registry.ts`** — single source of truth for all GLB paths. Room manifests
reference `MODELS.xyz` instead of hardcoded strings.

```
Furniture:    bathroomSink, bathroomToilet, bathroomTub, bed, bookshelf,
              desk, dresser, parentsBed, wardrobe
Architecture: window, door
Props:        journal, lamp, lightSwitch, map, wallLamp
```

All models live under `public/models/{furniture|architecture|props}/bunny_*.glb`.

---

## Centralized GLB Loader

**`models/loaders/loadFittedGLB.ts`** — the single place all GLB loading goes through.

```typescript
interface FitGLBOptions {
  id?:               string;          // for logging
  modelPath:         string;
  position:          [number, number, number];
  fitSize:           [number, number, number];  // target bounding box
  fitPlane?:         "xz" | "xy";    // which axes are compared; default "xz"
  rotation?:         [number, number, number];  // applied BEFORE measuring
  scale?:            number | [number, number, number];  // skips auto-fit
  tintColor?:        number;          // tints blank/white materials
  materialOverrides?: Record<string, number>;   // recolour named materials
}
```

**Pipeline (in order):**
1. Clone GLB scene (`gltf.scene.clone(true)` — shared cache, fresh graph)
2. Apply `rotation` (Euler XYZ) — rotate BEFORE measuring so auto-scale uses the post-rotation footprint
3. Auto-scale: `fitScale = min(targetA/naturalA, targetB/naturalB)` where A,B = fitPlane axes
4. **Y-centering**: `model.position.y = position[1] - bboxCenterY` — places bbox centre at manifest Y regardless of GLB pivot convention (base-at-origin or centre-at-origin)
5. Apply `tintColor` to blank white materials (no map, r/g/b > 0.99)
6. Apply `materialOverrides` — exact match then startsWith for Blender `.001` suffixes; always clones before mutating
7. Set position XZ and enable castShadow/receiveShadow on all meshes

**Key gotcha — wardrobe height**: fitPlane "xz" ignores Y, so a tall model (wardrobe: 4.615 natural H) can auto-scale to a height larger than the manifest intends. Fix: add `modelScale: 0.477` (= 2.2/4.615) to cap height explicitly. Always check: `scaledHeight = naturalH × fitScale`. If > wallHeight-ish, use explicit `modelScale`.

---

## Room Manifest System

**`engine/loaders/types.ts`** — canonical type definitions.

### ObjectDef types

| Type | Description |
|------|-------------|
| `FurnitureObjectDef` | Collidable items; optional GLB via `modelPath`; hitbox always from `size` |
| `BookObjectDef` | Flat interactables (journal, map); same GLB support as furniture |
| `PickupObjectDef` | Disappears on click; added to inventory; `modelType` keys PICKUP_MESH_BUILDERS |
| `LampObjectDef` | Floor lamp; `modelPath` optional — falls back to procedural mesh |
| `WallLampObjectDef` | Wall sconce; `facing` sets arm direction; `modelPath` optional |

### GLBModelFields (mixin on Furniture + Book)
```typescript
modelPath?:         string;
modelRotation?:     [number, number, number];
modelScale?:        number | [number, number, number];
materialOverrides?: Record<string, number>;  // keyed by GLB material name
```

### InteractionGate (mixin on Furniture + Book)
```typescript
requiredItem?:        string;   // item ID that must be in collectedIds
requiredItemMessage?: string;   // dialog shown when gate is closed
```
When `requiredItem` is set, the interaction is blocked until the item is collected.
Extend to `requiredItems: string[]` or `requiredFlag` for richer puzzles without engine changes.

### Wall-facing rotation convention
```
North wall objects face south (+Z): no rotation needed (model default)
South wall objects face north (-Z): [0, Math.PI, 0]
West wall objects face east  (+X): [0, Math.PI / 2, 0]
East wall objects face west  (-X): [0, -Math.PI / 2, 0]
```
Doors on north/south walls: size [0.9, 2.2, 0.15] — thin Z, no rotation needed.
Doors on east/west walls:   size [0.15, 2.2, 0.9] — thin X, rotation [0, Math.PI/2, 0].

### Journal / flat-book rotation
GLB exports standing upright (cover faces +Z). To lay flat with cover up:
`modelRotation: [Math.PI / 2, 0, 0]`
(The `-Math.PI/2` variant puts the cover face-down.)

---

## ObjectLoader

**`engine/loaders/ObjectLoader.ts`** — reads a `RoomManifest` and builds:
- `interactables: InteractableObject[]` — raycasted, labelled, interaction callbacks
- `pickupItems: PickupItem[]` — disappear on click
- `decoratives: THREE.Object3D[]` — added to scene but not raycasted

### Lamp GLB support
When `def.modelPath` is set on a lamp:
- Floor lamp: `loadFittedGLB` with `position[1] = 1.0` (center of 2m lamp), `fitSize [0.4, 2.0, 0.4]`; point light added separately to decoratives at world `y = 2.0 × 0.85 = 1.7`; shade material found by name containing `"ShadeFabric"`
- Wall lamp: `fitSize [0.15, 0.45, 0.35]`; rotation derived from `facing`; point light offset 0.25 units in the facing direction; shade by `"ShadeFabric"` in name

### LampParts
```typescript
interface LampParts {
  group:    THREE.Object3D;          // GLB model or procedural Group
  light:    THREE.PointLight;
  shadeMat: MeshLambertMaterial | MeshStandardMaterial;
  isOn:     boolean;
}
```
Toggle interaction (`lamp-toggle`) sets `light.intensity`, `shadeMat.emissive`, `shadeMat.emissiveIntensity`, `shadeMat.color`.

### PICKUP_MESH_BUILDERS
```typescript
{ key: buildKeyMesh, map: buildMapMesh }
```
Add entries here for new pickup shapes — no scene or factory changes required.

---

## Rooms

All rooms are manifest-driven (`scenes/<room>/data/room.ts`). Adding objects requires only editing the manifest — no scene code changes.

| Room | Dimensions | Key objects wired with GLB |
|------|-----------|---------------------------|
| `tutorial` | 8×8 | wardrobe, dresser, desk, door, bed (green), light-switch, journal (flat), floor-lamp. Door gated: requires `"golden-key"`. Map is a pickup (unlocks minimap). |
| `sibling` | 7×7 | bed (blue), bookshelf, desk, sketchbook (flat), light-switch, floor-lamp |
| `hallway` | 12×5 | 5 doors (bedroom, sibling, bathroom, parents, dining), 2 wall sconces (GLB) |
| `bathroom` | 4×4 | door, toilet, bathtub, sink (rotated east wall) |
| `parents` | 9×8 | parentsBed GLB, wardrobe (modelScale:0.477 height fix), 2 floor lamps, 2 switches, vanity, armchair |
| `dining` | 8×7 | china-cabinet (bookshelf GLB), sideboard (dresser GLB), 2 doors, light-switch, floor-lamp |
| `kitchen` | 7×6 | 2 doors, counter, sink, fridge, island, light-switch, floor-lamp |
| `living` | 9×8 | bookshelf (west wall), sofa, TV, coffee table, armchair, front door, light-switch, floor-lamp |
| `outside` | outdoor | placeholder |
| `neighborhood` | outdoor | placeholder |

### Scene transitions
All room connections are bidirectional via `interaction: { kind: "scene-change", targetRoomId }`.
`switchRoom()` in `useGame` handles fade-out → scene swap → fade-in.

---

## Collectables / Items

**`lib/items.ts`**

```typescript
interface CollectableItem {
  id, name, emoji, category: "food"|"key"|"tool"|"quest"|"misc"
  description: string
  unlock?: "minimap"   // side effect fired by GameCanvas on collection
}
```

| ID | Name | Effect |
|----|------|--------|
| `"golden-key"` | Golden Key 🔑 | Unlocks tutorial room door |
| `"house-map"` | House Map 🗺️ | `unlock: "minimap"` → unlocks MinimapHUD |

GameCanvas pickup effect: finds item, calls `addItem`, checks `item.unlock === "minimap"` and calls `setMinimapUnlocked(true)` directly — no separate `mapTriggered` path needed.

---

## Inventory System

**`lib/inventory.ts`** — clothing items:
- `WARDROBE_ITEMS`: 4 outerwear (🧥 Raincoat, 🥼 Long Coat, 🎽 Hoodie, 🧣 Scarf)
- `DRESSER_ITEMS`: 6 items — 3 tops + 3 bottoms

**`hooks/useInventory.ts`** — `equipped`, `equip(item)`, `unequip(category)`
**`hooks/useItems.ts`** — `items: CollectedItem[]`, `addItem(item)`

---

## Game Engine Architecture

```
engine/
  core/
    Camera.ts       — PerspectiveCamera wrapper, resize()
    Loop.ts         — rAF loop, add(fn)/stop()/start()
    Renderer.ts     — WebGLRenderer + EffectComposer (RenderPass→OutlinePass→OutputPass)
    SceneManager.ts — loads/unloads BaseScene, update() each frame
    SceneRouter.ts  — registry of RoomManifest → RoomScene; all rooms registered in useGame
  input/
    InputManager.ts — pointermove→onHover(), pointerdown→onClick()
  interaction/
    Raycaster.ts    — castFirst(pointer, camera, targets)
  objects/
    LabelSprite.ts        — floating pill label, dual CanvasTexture hover swap
    InteractableObject.ts — mesh + label + onInteract, setHovered() passthrough
    PickupItem.ts         — disappears on click, calls onPickup(itemId)
  characters/
    Character.ts       — abstract base: walkTo(), isMoving gate, update()
    ClothingLayers.ts  — SHARED utility: buildClothingLayers(body), applyEquipped(layers, equipped)
    PreviewBunny.ts    — dressing room preview bunny (auto-spin, setEquipped, eyes/nose)
  loaders/
    ObjectLoader.ts    — manifest → interactables + pickupItems + decoratives
    types.ts           — all ObjectDef types, RoomManifest, RoomCallbacks
  builders/
    Walls.ts           — procedural room walls with door cutout
    Windows.ts         — places window GLB models from manifest
```

---

## Characters

### MrBunny (`characters/MrBunny.ts`)
- Extends `Character`, speed = 3
- `CapsuleGeometry(0.25, 0.5)` cream body with ears + inner ears
- Clothing layers via `buildClothingLayers` (shared utility)
- Walking animation: `Math.max(0, sin(time × 6π))` → clean hops at 6 Hz with squash-and-stretch
- Landing squash `(1.14, 0.86, 1.14)` springs back at 14× delta
- `setEquipped(equipped)` → `applyEquipped(this.clothing, equipped)`

### PreviewBunny (`engine/characters/PreviewBunny.ts`)
- Same body + clothing as MrBunny, plus eyes (0.045) and nose (0.03)
- Auto-spins: `group.rotation.y += delta × 0.55`

---

## The `useGame` Hook

`hooks/useGame.ts` — React bridge to engine. Key outputs:
```
isLoading, loadProgress
dialog, dismissDialog
inventorySource, dismissInventory
pickedUpItemId, clearPickedUp
journalTriggered, clearJournalTrigger
mapTriggered, clearMapTrigger
currentRoomId, switchRoom(id)
isFading, flagTick, bumpFlagTick
setEquipped
```

Room registry in `useGame.ts` — add new rooms to the `router` here.

---

## Puzzle System (scalable)

### Current puzzles
- **Tutorial door** — gated by `requiredItem: "golden-key"`. Player must collect the golden key from the floor before the door to the hallway opens.
- **Minimap** — gated by collecting `"house-map"` (flat pickup on the desk). Unlocks via `item.unlock === "minimap"` in GameCanvas.

### Adding a new puzzle gate
In any `FurnitureObjectDef` or `BookObjectDef`:
```typescript
requiredItem:        "item-id",
requiredItemMessage: "Hint shown when gate is closed. 🔒",
```
No engine changes required. Extend `InteractionGate` for richer conditions (multiple items, flags, etc.).

### Adding a new collectable
1. Add entry to `GAME_ITEMS` in `lib/items.ts`
2. Add mesh builder to `PICKUP_MESH_BUILDERS` in `ObjectLoader.ts` (or use existing `key`/`map`)
3. Add `type: "pickup"`, `modelType`, `itemId` to the room manifest

---

## Known Issues / To-Do

### Upcoming (highest priority)
- [ ] **Journal UI** — physical journal object exists; needs split-panel notebook UI (lined paper CSS, Caveat font, quest list left + content right)
- [ ] **Explorer mode** — physical journal in tutorial room already wired; pill label on journal needed for Explorer mode unlock
- [ ] **Map GLB on desk** — currently replaced by procedural pickup mesh. If you want the GLB visual back on the desk, consider keeping a decorative-only copy alongside the pickup, or extend PickupObjectDef with `modelPath?`
- [ ] **Audio** — toggles wired to localStorage, no sound yet
- [ ] **Save system** — Continue is disabled; no persistence beyond username + flags + journal

### Wardrobe height pattern
Any very tall GLB (wardrobe: 4.615H) fitted with fitPlane "xz" will overshoot the target height because Y is not constrained. Fix: add `modelScale` explicitly. Formula: `modelScale = targetHeight / naturalHeight`.

### Player Customisation (planned — do not implement yet)
- [ ] Room personalisation — bed/wall/floor colour per room should be player-driven
- [ ] Character appearance — fur colour, eye colour, default outfit
- [ ] Store in `localStorage` as `tgb_prefs_{username}`, load on `/play` boot

---

## Key Patterns to Preserve

1. **Glass cards**: `bg-gray-900/[60|70|90] backdrop-blur-md border border-white/[8|10]` — on ALL card/panel UI
2. **arcTo pill** in `LabelSprite.buildTexture()` — do NOT use `ctx.roundRect()` (browser compat)
3. **`ssr: false`** on `GameCanvasLoader` — Three.js must never run server-side
4. **Rotate-before-measure** in `loadFittedGLB` — always apply `modelRotation` before measuring the bounding box for auto-scale
5. **Y-centering formula**: `model.position.y = position[1] - bboxCenterY` — works for both base-at-origin and centre-at-origin GLBs
6. **Material clone before mutate** — `gltf.scene.clone(true)` shares instances; always `mat.clone()` before changing colour
7. **`isMoving` gate** in Character — clicking during a walk is intentionally a no-op
8. **Hierarchy traversal** in handleClick — walk `.parent` until `userData.interactable`
9. **`InteractionGate` for puzzle locks** — use `requiredItem` / `requiredItemMessage` on the manifest object, never in scene code
10. **`item.unlock` for side effects** — declare unlock behaviour in `GAME_ITEMS`, handle in GameCanvas pickup effect
11. **`EquippedClothing` from `lib/inventory.ts`** — canonical shared type
12. **`ClothingLayers.ts`** — always use the shared utility for clothing meshes
13. **Commit + push after every meaningful change** — Vercel auto-deploys on push
14. **Inventory HUD is read-only** — equip/unequip only in wardrobe/dresser panels

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
