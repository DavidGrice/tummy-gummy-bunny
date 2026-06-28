"use client";

import { useState } from "react";
import { WARDROBE_ITEMS, DRESSER_ITEMS } from "@/lib/inventory";
import type { InventoryItem, ItemCategory as ClothingCategory } from "@/lib/inventory";
import type { EquippedItems } from "@/hooks/useInventory";
import type { CollectedItem, ItemCategory } from "@/lib/items";
import { INVENTORY_GRID_SIZE } from "@/lib/items";
import { Tooltip } from "@/components/ui/Tooltip";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section     = "clothing" | "items";
type ClothingTab = "all" | "outerwear" | "top" | "bottom";

const CLOTHING_TABS: { id: ClothingTab; label: string }[] = [
  { id: "all",       label: "All"       },
  { id: "outerwear", label: "Outerwear" },
  { id: "top",       label: "Tops"      },
  { id: "bottom",    label: "Bottoms"   },
];

const ITEM_FILTERS: { id: ItemCategory | "all"; label: string }[] = [
  { id: "all",     label: "All"     },
  { id: "food",    label: "Food"    },
  { id: "key",     label: "Keys"    },
  { id: "tool",    label: "Tools"   },
  { id: "special", label: "Special" },
];

const ALL_CLOTHING: InventoryItem[] = [...WARDROBE_ITEMS, ...DRESSER_ITEMS];

const CLOTHING_LABELS: Record<ClothingCategory, string> = {
  outerwear: "Outerwear",
  top:       "Tops",
  bottom:    "Bottoms",
};

const CLOTHING_SOURCE: Record<ClothingCategory, string> = {
  outerwear: "Wardrobe",
  top:       "Dresser",
  bottom:    "Dresser",
};

// ─── Clothing section ─────────────────────────────────────────────────────────

function ClothingSection({ equipped }: { equipped: EquippedItems }) {
  const [tab, setTab] = useState<ClothingTab>("all");

  const visible = ALL_CLOTHING.filter(
    (item) => tab === "all" || item.category === tab
  );

  const isOn = (item: InventoryItem) => equipped[item.category]?.id === item.id;

  return (
    <div className="flex flex-col gap-4">

      {/* Currently wearing strip */}
      <div className="rounded-2xl bg-white/5 border border-white/8 px-4 py-3">
        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Currently wearing</p>
        <div className="flex gap-3 items-center min-h-[28px]">
          {(["outerwear", "top", "bottom"] as ClothingCategory[]).some((c) => equipped[c]) ? (
            (["outerwear", "top", "bottom"] as ClothingCategory[])
              .filter((c) => equipped[c])
              .map((c) => (
                <span key={c} className="text-2xl select-none" title={`${CLOTHING_LABELS[c]}: ${equipped[c]!.name}`} aria-label={equipped[c]!.name}>
                  {equipped[c]!.emoji}
                </span>
              ))
          ) : (
            <span className="text-white/20 text-xs italic">Visit the wardrobe or dresser to get dressed!</span>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {CLOTHING_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 ${
              tab === id
                ? "bg-summer-coral text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Item list */}
      <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
        {visible.map((item) => {
          const on = isOn(item);
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/8"
            >
              <span className="text-xl leading-none w-8 text-center select-none" aria-hidden>{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-summer-cream truncate">{item.name}</p>
                <p className="text-[10px] text-summer-peach/50 tracking-wide uppercase">{CLOTHING_SOURCE[item.category]}</p>
              </div>
              {on && (
                <span className="text-[10px] font-black uppercase tracking-widest text-summer-coral px-2 py-0.5 rounded-full border border-summer-coral/30 shrink-0">
                  On
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-center text-summer-peach/30 tracking-wide">
        Visit the wardrobe or dresser to change clothes
      </p>
    </div>
  );
}

// ─── Items grid + detail section ─────────────────────────────────────────────

function ItemsSection({ items }: { items: CollectedItem[] }) {
  const [filter,       setFilter]       = useState<ItemCategory | "all">("all");
  const [selectedItem, setSelectedItem] = useState<CollectedItem | null>(null);

  const filtered = filter === "all"
    ? items
    : items.filter((c) => c.item.category === filter);

  // Fixed 12-slot grid, pad with nulls
  const slots: (CollectedItem | null)[] = [
    ...filtered,
    ...Array<null>(Math.max(0, INVENTORY_GRID_SIZE - filtered.length)).fill(null),
  ].slice(0, INVENTORY_GRID_SIZE);

  // Clear selection if it's not in the current filter view
  const active =
    selectedItem &&
    (filter === "all" || selectedItem.item.category === filter)
      ? selectedItem
      : null;

  function toggleSelect(slot: CollectedItem | null) {
    if (!slot) return;
    setSelectedItem((prev) => (prev?.item.id === slot.item.id ? null : slot));
  }

  return (
    <div className="flex gap-3">

      {/* Left — filter chips + grid */}
      <div className="flex flex-col gap-3 flex-1 min-w-0">

        {/* Category filter chips */}
        <div className="flex flex-wrap gap-1">
          {ITEM_FILTERS.map(({ id, label }) => {
            const hasItems = id === "all"
              ? items.length > 0
              : items.some((c) => c.item.category === id);
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                disabled={!hasItems && id !== "all"}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all duration-150 ${
                  filter === id
                    ? "bg-summer-coral text-white"
                    : hasItems
                      ? "bg-white/10 text-white/60 hover:text-white/90 hover:bg-white/15"
                      : "bg-white/5 text-white/20 cursor-not-allowed"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 3-column item grid */}
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot, i) => {
            const isActive = slot && active?.item.id === slot.item.id;
            return (
              <button
                key={i}
                onClick={() => toggleSelect(slot)}
                disabled={!slot}
                aria-label={slot ? `${slot.item.name}, quantity ${slot.quantity}` : "Empty slot"}
                className={`
                  relative aspect-square rounded-xl flex items-center justify-center
                  border transition-all duration-150
                  ${slot
                    ? isActive
                      ? "border-summer-coral bg-summer-coral/15 shadow-[0_0_0_2px_rgba(191,63,30,0.35)] cursor-pointer"
                      : "border-white/20 bg-white/8 hover:bg-white/15 hover:border-white/30 cursor-pointer active:scale-95"
                    : "border-white/8 bg-white/3 border-dashed cursor-default"
                  }
                `}
              >
                {slot ? (
                  <>
                    <span className="text-2xl leading-none select-none" aria-hidden>{slot.item.emoji}</span>
                    {slot.quantity > 1 && (
                      <span className="absolute bottom-0.5 right-1 text-[9px] font-black text-summer-cream/60 leading-none">
                        ×{slot.quantity}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-white/10 text-xs select-none" aria-hidden>·</span>
                )}
              </button>
            );
          })}
        </div>

        {items.length === 0 && (
          <p className="text-[10px] text-center text-summer-peach/30 tracking-wide pt-1">
            Explore the room to collect items
          </p>
        )}
      </div>

      {/* Right — item detail panel */}
      <div className="w-24 shrink-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/3 px-2 py-4 text-center">
        {active ? (
          <>
            <span className="text-4xl leading-none select-none" aria-hidden>{active.item.emoji}</span>
            <p className="text-[11px] font-black text-summer-cream leading-tight">{active.item.name}</p>
            <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-white/10 text-summer-peach/60">
              {active.item.category}
            </span>
            {active.quantity > 1 && (
              <p className="text-[10px] text-summer-peach/50">×{active.quantity}</p>
            )}
            <p className="text-[10px] text-summer-peach/50 leading-snug mt-0.5 px-1">
              {active.item.description}
            </p>
          </>
        ) : (
          <>
            <span className="text-3xl leading-none select-none text-white/15" aria-hidden>📦</span>
            <p className="text-[10px] text-summer-peach/25 leading-snug px-1">
              Select an item to see details
            </p>
          </>
        )}
      </div>

    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface InventoryHUDProps {
  equipped: EquippedItems;
  items:    CollectedItem[];
}

export function InventoryHUD({ equipped, items }: InventoryHUDProps) {
  const [isOpen,  setIsOpen]  = useState(false);
  const [section, setSection] = useState<Section>("clothing");

  const equippedCount = (["outerwear", "top", "bottom"] as ClothingCategory[])
    .filter((c) => equipped[c]).length;

  return (
    <>
      {/* FAB — wrapper holds absolute position so Tooltip nests cleanly */}
      <div className="absolute bottom-5 right-5 z-20">
        <Tooltip content="Inventory" position="top" align="end">
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

      {/* Modal */}
      {isOpen && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gray-900/90 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.7)] px-6 py-7 flex flex-col gap-5">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-summer-cream">Inventory</h2>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close inventory"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all text-sm leading-none"
              >
                ✕
              </button>
            </div>

            {/* Section tabs: Clothing | Items */}
            <div className="flex gap-1.5 bg-white/5 rounded-xl p-1">
              {(["clothing", "items"] as Section[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSection(s)}
                  className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                    section === s
                      ? "bg-gray-900/80 text-summer-cream border border-white/10 shadow-sm"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {s === "clothing" ? "👗 Clothing" : "📦 Items"}
                </button>
              ))}
            </div>

            {/* Content */}
            {section === "clothing"
              ? <ClothingSection equipped={equipped} />
              : <ItemsSection items={items} />
            }

          </div>
        </div>
      )}
    </>
  );
}
