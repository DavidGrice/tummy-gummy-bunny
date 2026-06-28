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

type Filter = "all" | ClothingCategory | ItemCategory;

// Two-row filter groups — avoids horizontal overflow / scrollbar
const FILTER_ROWS: { label: string; filters: { id: Filter; label: string }[] }[] = [
  {
    label:   "Clothing",
    filters: [
      { id: "all",       label: "All"       },
      { id: "outerwear", label: "Outerwear" },
      { id: "top",       label: "Tops"      },
      { id: "bottom",    label: "Bottoms"   },
    ],
  },
  {
    label:   "Items",
    filters: [
      { id: "food",    label: "Food"    },
      { id: "key",     label: "Keys"    },
      { id: "tool",    label: "Tools"   },
      { id: "special", label: "Special" },
    ],
  },
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

/** Two-row filter chips — no horizontal overflow, grouped by Clothing / Items */
function FilterChips({
  active,
  onChange,
  items,
  discoveredIds,
}: {
  active:        Filter;
  onChange:      (f: Filter) => void;
  items:         CollectedItem[];
  discoveredIds: Set<string>;
}) {
  function hasContent(id: Filter): boolean {
    if (id === "all") return true;
    if (id === "outerwear" || id === "top" || id === "bottom")
      return ALL_CLOTHING.some((i) => i.category === id && discoveredIds.has(i.id));
    return items.some((c) => c.item.category === id);
  }

  return (
    <div className="shrink-0 px-4 pt-2 pb-1 space-y-1 border-b border-white/8">
      {FILTER_ROWS.map(({ label, filters }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/20 w-12 shrink-0">
            {label}
          </span>
          <div className="flex gap-1 flex-wrap">
            {filters.map(({ id, label: chipLabel }) => {
              const enabled = hasContent(id);
              return (
                <button
                  key={id}
                  onClick={() => onChange(id)}
                  disabled={!enabled}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all duration-150 ${
                    active === id
                      ? "bg-summer-coral text-white"
                      : enabled
                        ? "bg-white/10 text-white/50 hover:bg-white/15 hover:text-white/80"
                        : "bg-white/5 text-white/15 cursor-not-allowed"
                  }`}
                >
                  {chipLabel}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Unified item grid with hover-only visual cue and click to select */
function ItemGrid({
  equipped,
  collectables,
  discoveredIds,
  filter,
  selected,
  onSelect,
}: {
  equipped:      EquippedItems;
  collectables:  CollectedItem[];
  discoveredIds: Set<string>;
  filter:        Filter;
  selected:      SelectedSlot;
  onSelect:      (slot: SelectedSlot) => void;
}) {
  // Only show clothing the player has discovered by visiting the wardrobe/dresser
  const clothingSlots: GridSlot[] = ALL_CLOTHING
    .filter((item) => discoveredIds.has(item.id))
    .filter((item) => filter === "all" || item.category === filter)
    .map((item) => ({
      kind:       "clothing" as const,
      item,
      isEquipped: equipped[item.category]?.id === item.id,
    }));

  const collectableSlots: GridSlot[] = collectables
    .filter((c) => filter === "all" || c.item.category === filter)
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
              : "Nothing in this category yet"}
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
  const [filter,   setFilter]   = useState<Filter>("all");
  const [selected, setSelected] = useState<SelectedSlot>(null);

  function handleFilterChange(f: Filter) {
    setFilter(f);
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

          {/* Right — detail + filters + grid */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            <DetailPanel selected={selected} equipped={equipped} />
            <FilterChips
              active={filter}
              onChange={handleFilterChange}
              items={items}
              discoveredIds={discoveredIds}
            />
            <ItemGrid
              equipped={equipped}
              collectables={items}
              discoveredIds={discoveredIds}
              filter={filter}
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
