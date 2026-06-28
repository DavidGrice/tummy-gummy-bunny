"use client";

import { useRef, useState } from "react";
import { WARDROBE_ITEMS, DRESSER_ITEMS } from "@/lib/inventory";
import type { InventoryItem, ItemCategory as ClothingCategory } from "@/lib/inventory";
import type { EquippedItems } from "@/hooks/useInventory";
import type { CollectedItem, ItemCategory } from "@/lib/items";
import { INVENTORY_GRID_SIZE } from "@/lib/items";
import { usePreviewRenderer } from "@/hooks/usePreviewRenderer";
import { Tooltip } from "@/components/ui/Tooltip";

// ─── Shared panel size — must match JournalPanel ─────────────────────────────
// Both panels use max-w-2xl + PANEL_H so they're always the same container.
export const PANEL_H = "h-[68vh] min-h-[400px] max-h-[640px]";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_CLOTHING: InventoryItem[] = [...WARDROBE_ITEMS, ...DRESSER_ITEMS];

const CLOTHING_SOURCE: Record<ClothingCategory, string> = {
  outerwear: "Wardrobe",
  top:       "Dresser",
  bottom:    "Dresser",
};

const CLOTHING_LABEL: Record<ClothingCategory, string> = {
  outerwear: "Outerwear",
  top:       "Top",
  bottom:    "Bottom",
};

// Two-level filter: a main tab + optional clothing sub-tab
type MainTab = "all" | "clothing" | "quest" | "key" | "food" | "tool" | "misc";
type ClothingSubTab = "all" | "outerwear" | "top" | "bottom";

const MAIN_TABS: { id: MainTab; icon: string; label: string }[] = [
  { id: "all",      icon: "🔍", label: "All"     },
  { id: "clothing", icon: "👗", label: "Clothing" },
  { id: "quest",    icon: "⭐", label: "Quest"    },
  { id: "key",      icon: "🗝", label: "Keys"     },
  { id: "food",     icon: "🍎", label: "Food"     },
  { id: "tool",     icon: "🔧", label: "Tools"    },
  { id: "misc",     icon: "📦", label: "Misc"     },
];

const CLOTHING_SUBTABS: { id: ClothingSubTab; label: string }[] = [
  { id: "all",       label: "All"      },
  { id: "outerwear", label: "Outerwear"},
  { id: "top",       label: "Tops"     },
  { id: "bottom",    label: "Bottoms"  },
];

// ─── Slot types ───────────────────────────────────────────────────────────────

type GridSlot =
  | { kind: "clothing";    item: InventoryItem; isEquipped: boolean }
  | { kind: "collectable"; collected: CollectedItem }
  | { kind: "empty" };

type SelectedSlot = Exclude<GridSlot, { kind: "empty" }> | null;

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Live 3D preview — self-contained so the hook mounts/unmounts with the modal */
function InventoryPreview({ equipped }: { equipped: EquippedItems }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  usePreviewRenderer(canvasRef, equipped);
  return (
    <canvas
      ref={canvasRef}
      className="w-full flex-1 block min-h-0"
      aria-label="3D preview of your bunny"
    />
  );
}

/** Three equipment-slot indicators below the preview */
function EquipmentSlots({ equipped }: { equipped: EquippedItems }) {
  const slots: { cat: ClothingCategory; label: string }[] = [
    { cat: "outerwear", label: "Outer" },
    { cat: "top",       label: "Top"   },
    { cat: "bottom",    label: "Bottom"},
  ];
  return (
    <div className="shrink-0 px-3 py-3 border-t border-white/10">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/30 text-center mb-2">
        Currently wearing
      </p>
      <div className="flex justify-around gap-1">
        {slots.map(({ cat, label }) => {
          const item = equipped[cat];
          return (
            <div key={cat} className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border text-xl ${
                item
                  ? "border-white/20 bg-white/8"
                  : "border-white/8 bg-white/3 border-dashed"
              }`}>
                {item
                  ? <span className="select-none" aria-label={item.name}>{item.emoji}</span>
                  : <span className="text-white/15 text-xs select-none" aria-hidden>—</span>
                }
              </div>
              <span className="text-[9px] text-white/30 tracking-wide">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Fixed-height detail panel — populates on click, shows placeholder otherwise */
function DetailPanel({ selected, equipped }: { selected: SelectedSlot; equipped: EquippedItems }) {
  if (!selected) {
    return (
      <div className="shrink-0 h-28 flex items-center justify-center border-b border-white/10 px-4">
        <p className="text-white/20 text-xs text-center">Click an item to see details</p>
      </div>
    );
  }

  if (selected.kind === "clothing") {
    const { item, isEquipped } = selected;
    const source = CLOTHING_SOURCE[item.category];
    return (
      <div className="shrink-0 h-28 flex items-start gap-3 border-b border-white/10 px-4 py-3">
        <span className="text-4xl leading-none select-none shrink-0" aria-hidden>{item.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-black text-summer-cream truncate">{item.name}</p>
            <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-white/10 text-summer-peach/60 shrink-0">
              {CLOTHING_LABEL[item.category]}
            </span>
          </div>
          <p className="text-xs text-summer-peach/60 leading-snug line-clamp-2 mb-1.5">
            {item.description}
          </p>
          {isEquipped ? (
            <span className="text-[10px] font-black text-summer-coral uppercase tracking-widest">
              ● Equipped
            </span>
          ) : (
            <span className="text-[10px] text-white/30 uppercase tracking-widest">
              Visit {source} to equip
            </span>
          )}
        </div>
      </div>
    );
  }

  // Collectable item
  const { collected } = selected;
  return (
    <div className="shrink-0 h-28 flex items-start gap-3 border-b border-white/10 px-4 py-3">
      <span className="text-4xl leading-none select-none shrink-0" aria-hidden>{collected.item.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-black text-summer-cream truncate">{collected.item.name}</p>
          <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-white/10 text-summer-peach/60 shrink-0">
            {collected.item.category}
          </span>
        </div>
        <p className="text-xs text-summer-peach/60 leading-snug line-clamp-2 mb-1.5">
          {collected.item.description}
        </p>
        <span className="text-[10px] text-white/30 uppercase tracking-widest">
          ×{collected.quantity} in inventory
        </span>
      </div>
    </div>
  );
}

/** Full-width RPG-style tab bar + optional clothing sub-row */
function TabBar({
  mainTab,
  clothingSub,
  onMainTab,
  onClothingSub,
  collectables,
  discoveredIds,
}: {
  mainTab:       MainTab;
  clothingSub:   ClothingSubTab;
  onMainTab:     (t: MainTab) => void;
  onClothingSub: (s: ClothingSubTab) => void;
  collectables:  CollectedItem[];
  discoveredIds: Set<string>;
}) {
  function hasContent(id: MainTab): boolean {
    if (id === "all" || id === "clothing") return true;
    return collectables.some((c) => c.item.category === id);
  }

  return (
    <div className="shrink-0">
      {/* Main tab row */}
      <div className="flex border-b border-white/10">
        {MAIN_TABS.map(({ id, icon, label }) => {
          const active  = mainTab === id;
          const hasData = hasContent(id);
          return (
            <button
              key={id}
              onClick={() => onMainTab(id)}
              aria-label={label}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 border-b-2 transition-all duration-150 ${
                active
                  ? "border-summer-coral text-summer-coral bg-summer-coral/8"
                  : hasData
                    ? "border-transparent text-white/40 hover:text-white/70 hover:bg-white/5"
                    : "border-transparent text-white/20 hover:text-white/35"
              }`}
            >
              <span className="text-base leading-none select-none" aria-hidden>{icon}</span>
              <span className="text-[9px] font-black uppercase tracking-wide leading-none">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Clothing sub-tabs — only when Clothing tab is active */}
      {mainTab === "clothing" && (
        <div className="flex gap-1 px-3 py-1.5 bg-white/3 border-b border-white/8">
          {CLOTHING_SUBTABS.map(({ id, label }) => {
            const active = clothingSub === id;
            const hasItems =
              id === "all"
                ? discoveredIds.size > 0
                : ALL_CLOTHING.some((i) => i.category === id && discoveredIds.has(i.id));
            return (
              <button
                key={id}
                onClick={() => onClothingSub(id)}
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all duration-150 ${
                  active
                    ? "bg-summer-coral/25 text-summer-coral"
                    : hasItems
                      ? "text-white/45 hover:text-white/70"
                      : "text-white/20"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Unified item grid with hover-only visual cue and click to select */
function ItemGrid({
  equipped,
  collectables,
  discoveredIds,
  mainTab,
  clothingSub,
  selected,
  onSelect,
}: {
  equipped:      EquippedItems;
  collectables:  CollectedItem[];
  discoveredIds: Set<string>;
  mainTab:       MainTab;
  clothingSub:   ClothingSubTab;
  selected:      SelectedSlot;
  onSelect:      (slot: SelectedSlot) => void;
}) {
  const showClothing = mainTab === "all" || mainTab === "clothing";
  const showItems    = mainTab === "all" || mainTab !== "clothing";

  const clothingSlots: GridSlot[] = !showClothing ? [] : ALL_CLOTHING
    .filter((item) => discoveredIds.has(item.id))
    .filter((item) => mainTab !== "clothing" || clothingSub === "all" || item.category === clothingSub)
    .map((item) => ({
      kind:       "clothing" as const,
      item,
      isEquipped: equipped[item.category]?.id === item.id,
    }));

  const collectableSlots: GridSlot[] = !showItems ? [] : collectables
    .filter((c) => mainTab === "all" || c.item.category === mainTab)
    .map((c) => ({ kind: "collectable" as const, collected: c }));

  const filled: GridSlot[] = [...clothingSlots, ...collectableSlots];
  const empties: GridSlot[] = Array(Math.max(0, INVENTORY_GRID_SIZE - filled.length))
    .fill({ kind: "empty" } as GridSlot);
  const slots = [...filled, ...empties].slice(0, INVENTORY_GRID_SIZE);

  function toggle(slot: GridSlot) {
    if (slot.kind === "empty") return;

    if (slot.kind === "clothing") {
      const alreadySelected =
        selected?.kind === "clothing" && selected.item.id === slot.item.id;
      onSelect(alreadySelected ? null : slot);
    } else {
      const alreadySelected =
        selected?.kind === "collectable" &&
        selected.collected.item.id === slot.collected.item.id;
      onSelect(alreadySelected ? null : slot);
    }
  }

  function isActive(slot: GridSlot): boolean {
    if (slot.kind === "empty" || !selected) return false;
    if (slot.kind === "clothing" && selected.kind === "clothing")
      return slot.item.id === selected.item.id;
    if (slot.kind === "collectable" && selected.kind === "collectable")
      return slot.collected.item.id === selected.collected.item.id;
    return false;
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
      <div className="grid grid-cols-5 gap-2">
        {slots.map((slot, i) => {
          const active = isActive(slot);
          const isEmpty = slot.kind === "empty";
          const emoji =
            slot.kind === "clothing"    ? slot.item.emoji :
            slot.kind === "collectable" ? slot.collected.item.emoji : null;
          const isEquippedClothing =
            slot.kind === "clothing" && slot.isEquipped;
          const qty =
            slot.kind === "collectable" && slot.collected.quantity > 1
              ? slot.collected.quantity
              : null;

          return (
            <button
              key={i}
              onClick={() => toggle(slot)}
              disabled={isEmpty}
              aria-label={
                slot.kind === "clothing"    ? slot.item.name :
                slot.kind === "collectable" ? slot.collected.item.name :
                "Empty slot"
              }
              className={`
                relative aspect-square rounded-xl flex items-center justify-center
                border transition-all duration-150 outline-none
                ${isEmpty
                  ? "border-white/8 bg-white/3 border-dashed cursor-default"
                  : active
                    ? "border-summer-coral bg-summer-coral/15 shadow-[0_0_0_2px_rgba(191,63,30,0.3)] scale-105 cursor-pointer"
                    : "border-white/15 bg-white/5 cursor-pointer hover:border-white/40 hover:bg-white/12 hover:scale-[1.07] active:scale-95 focus-visible:border-white/40"
                }
              `}
            >
              {emoji && (
                <span className="text-2xl leading-none select-none" aria-hidden>
                  {emoji}
                </span>
              )}
              {isEmpty && (
                <span className="text-white/10 text-xs select-none" aria-hidden>·</span>
              )}
              {/* Equipped dot badge */}
              {isEquippedClothing && !active && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-summer-coral" />
              )}
              {/* Quantity badge */}
              {qty && (
                <span className="absolute bottom-0.5 right-1 text-[9px] font-black text-summer-cream/60 leading-none">
                  ×{qty}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {slots.every((s) => s.kind === "empty") && (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <span className="text-3xl opacity-20 select-none" aria-hidden>🎒</span>
          <p className="text-white/25 text-xs leading-snug max-w-[160px]">
            {discoveredIds.size === 0 && collectables.length === 0
              ? "Visit the wardrobe or dresser to discover clothing"
              : mainTab === "clothing"
                ? "Explore the room to discover clothing"
                : "No items here yet — explore to find them!"}
          </p>
        </div>
      )}
    </div>
  );
}

/** The full modal content — separate component so hooks run fresh each open */
function InventoryModal({
  equipped,
  items,
  discoveredIds,
  onClose,
}: {
  equipped:      EquippedItems;
  items:         CollectedItem[];
  discoveredIds: Set<string>;
  onClose:       () => void;
}) {
  const [mainTab,     setMainTab]     = useState<MainTab>("all");
  const [clothingSub, setClothingSub] = useState<ClothingSubTab>("all");
  const [selected,    setSelected]    = useState<SelectedSlot>(null);

  function handleMainTab(t: MainTab) {
    setMainTab(t);
    setClothingSub("all");
    setSelected(null);
  }

  function handleClothingSub(s: ClothingSubTab) {
    setClothingSub(s);
    setSelected(null);
  }

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`relative z-10 w-full max-w-2xl flex flex-col overflow-hidden rounded-2xl bg-gray-900/90 backdrop-blur-md border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] ${PANEL_H}`}>

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h2 className="text-sm font-black uppercase tracking-widest text-summer-cream">Inventory</h2>
          <button
            onClick={onClose}
            aria-label="Close inventory"
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all text-sm leading-none"
          >
            ✕
          </button>
        </div>

        {/* Two-column body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Left — preview + equipment slots */}
          <div className="w-[200px] shrink-0 flex flex-col border-r border-white/10 bg-white/3">
            <InventoryPreview equipped={equipped} />
            <EquipmentSlots equipped={equipped} />
          </div>

          {/* Right — detail + tab bar + grid */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            <DetailPanel selected={selected} equipped={equipped} />
            <TabBar
              mainTab={mainTab}
              clothingSub={clothingSub}
              onMainTab={handleMainTab}
              onClothingSub={handleClothingSub}
              collectables={items}
              discoveredIds={discoveredIds}
            />
            <ItemGrid
              equipped={equipped}
              collectables={items}
              discoveredIds={discoveredIds}
              mainTab={mainTab}
              clothingSub={clothingSub}
              selected={selected}
              onSelect={setSelected}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

interface InventoryHUDProps {
  equipped:      EquippedItems;
  items:         CollectedItem[];
  discoveredIds: Set<string>;
}

export function InventoryHUD({ equipped, items, discoveredIds }: InventoryHUDProps) {
  const [isOpen, setIsOpen] = useState(false);

  const equippedCount = (["outerwear", "top", "bottom"] as ClothingCategory[])
    .filter((c) => equipped[c]).length;

  return (
    <>
      {/* FAB */}
      <div className="absolute bottom-5 right-5 z-20">
        <Tooltip content="Inventory" position="left">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open inventory"
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gray-900/80 backdrop-blur-md border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-gray-900/95 hover:border-white/30 transition-all active:scale-95"
          >
            <span className="text-2xl leading-none select-none" aria-hidden>🎒</span>
            {equippedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-summer-coral text-white text-[10px] font-black flex items-center justify-center leading-none">
                {equippedCount}
              </span>
            )}
          </button>
        </Tooltip>
      </div>

      {/* Modal — separate component so preview hook lifecycle is clean */}
      {isOpen && (
        <InventoryModal
          equipped={equipped}
          items={items}
          discoveredIds={discoveredIds}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
