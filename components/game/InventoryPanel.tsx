"use client";

import type { EquippedItems } from "@/hooks/useInventory";
import type { InventoryItem, ItemCategory } from "@/lib/inventory";
import { WARDROBE_ITEMS, DRESSER_ITEMS } from "@/lib/inventory";

export type InventorySource = "wardrobe" | "dresser";

interface Props {
  source:   InventorySource;
  equipped: EquippedItems;
  onEquip:   (item: InventoryItem) => void;
  onUnequip: (category: ItemCategory) => void;
  onClose:   () => void;
}

export function InventoryPanel({ source, equipped, onEquip, onUnequip, onClose }: Props) {
  const allItems = source === "wardrobe" ? WARDROBE_ITEMS : DRESSER_ITEMS;
  const tops     = allItems.filter((i) => i.category === "top");
  const bottoms  = allItems.filter((i) => i.category === "bottom");
  const outwear  = allItems.filter((i) => i.category === "outerwear");

  const isEquipped = (item: InventoryItem) => equipped[item.category]?.id === item.id;

  function handleItem(item: InventoryItem) {
    if (isEquipped(item)) onUnequip(item.category);
    else onEquip(item);
  }

  const wearing = [equipped.outerwear, equipped.top, equipped.bottom].filter(Boolean);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-black/40">
      <div className="rounded-3xl bg-gray-900/70 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] w-full max-w-sm px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-summer-cream font-black text-xl uppercase tracking-widest">
            {source === "wardrobe" ? "🧥 Wardrobe" : "🗄️ Dresser"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white/30 hover:text-white/70 text-3xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Currently wearing */}
        <div className="mb-6 rounded-2xl bg-white/5 border border-white/8 px-4 py-3">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Currently wearing</p>
          <div className="flex gap-3 items-center min-h-[32px]">
            {wearing.length > 0
              ? wearing.map((item) => (
                  <span key={item!.id} className="text-2xl" title={item!.name}>
                    {item!.emoji}
                  </span>
                ))
              : <span className="text-white/20 text-sm italic">Nothing yet — pick something!</span>
            }
          </div>
        </div>

        {/* Item grids */}
        {source === "wardrobe" && (
          <ItemSection
            label="Outerwear"
            items={outwear}
            equipped={equipped}
            onItemClick={handleItem}
            isEquipped={isEquipped}
          />
        )}

        {source === "dresser" && (
          <>
            <ItemSection
              label="Tops"
              items={tops}
              equipped={equipped}
              onItemClick={handleItem}
              isEquipped={isEquipped}
            />
            <ItemSection
              label="Bottoms"
              items={bottoms}
              equipped={equipped}
              onItemClick={handleItem}
              isEquipped={isEquipped}
            />
          </>
        )}

        {/* Done button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-2xl bg-summer-coral text-white font-black uppercase tracking-widest text-sm min-h-[44px] hover:bg-summer-coral/80 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function ItemSection({
  label,
  items,
  onItemClick,
  isEquipped,
}: {
  label:       string;
  items:       InventoryItem[];
  equipped:    EquippedItems;
  onItemClick: (item: InventoryItem) => void;
  isEquipped:  (item: InventoryItem) => boolean;
}) {
  return (
    <div className="mb-5">
      <p className="text-white/40 text-xs uppercase tracking-widest mb-3">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => {
          const active = isEquipped(item);
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item)}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all min-h-[44px] ${
                active
                  ? "bg-summer-coral/25 border-summer-coral/70 text-white"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/25"
              }`}
            >
              <span className="text-2xl leading-none">{item.emoji}</span>
              <span className="text-xs text-center leading-tight mt-1">{item.name}</span>
              {active && (
                <span className="text-[10px] text-summer-coral font-bold uppercase tracking-wider">On</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
