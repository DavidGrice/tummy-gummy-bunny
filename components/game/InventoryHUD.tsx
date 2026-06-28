"use client";

import { useState } from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import { WARDROBE_ITEMS, DRESSER_ITEMS } from "@/lib/inventory";
import type { InventoryItem, ItemCategory } from "@/lib/inventory";
import type { EquippedItems } from "@/hooks/useInventory";

type Tab = "all" | "outerwear" | "top" | "bottom";

const TABS: { id: Tab; label: string }[] = [
  { id: "all",       label: "All"       },
  { id: "outerwear", label: "Outerwear" },
  { id: "top",       label: "Tops"      },
  { id: "bottom",    label: "Bottoms"   },
];

const ALL_ITEMS: InventoryItem[] = [...WARDROBE_ITEMS, ...DRESSER_ITEMS];

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  outerwear: "Outerwear",
  top:       "Tops",
  bottom:    "Bottoms",
};

const CATEGORY_SOURCE: Record<ItemCategory, string> = {
  outerwear: "wardrobe",
  top:       "dresser",
  bottom:    "dresser",
};

interface Props {
  equipped: EquippedItems;
}

export function InventoryHUD({ equipped }: Props) {
  const [isOpen,    setIsOpen]    = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const equippedCount = [equipped.outerwear, equipped.top, equipped.bottom]
    .filter(Boolean).length;

  const isEquipped = (item: InventoryItem) => equipped[item.category]?.id === item.id;

  const filteredItems = activeTab === "all"
    ? ALL_ITEMS
    : ALL_ITEMS.filter((i) => i.category === activeTab);

  const grouped: Record<ItemCategory, InventoryItem[]> = {
    outerwear: filteredItems.filter((i) => i.category === "outerwear"),
    top:       filteredItems.filter((i) => i.category === "top"),
    bottom:    filteredItems.filter((i) => i.category === "bottom"),
  };

  const categoriesToShow: ItemCategory[] = activeTab === "all"
    ? ["outerwear", "top", "bottom"]
    : [activeTab as ItemCategory];

  return (
    <>
      {/* Floating action button — wrapper holds the absolute position so Tooltip works */}
      <div className="absolute bottom-5 right-5 z-20">
        <Tooltip content="Inventory" position="top" align="end">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open inventory"
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gray-900/80 backdrop-blur-md border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-gray-900/95 hover:border-white/30 transition-all active:scale-95"
          >
            <span className="text-2xl leading-none">🎒</span>
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
        <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-black/40">
          <div className="rounded-3xl bg-gray-900/70 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] w-full max-w-sm flex flex-col max-h-[80vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
              <div>
                <h2 className="text-summer-cream font-black text-xl uppercase tracking-widest">
                  🎒 Inventory
                </h2>
                <p className="text-white/40 text-xs mt-0.5">
                  {equippedCount === 0
                    ? "Nothing equipped yet"
                    : `${equippedCount} item${equippedCount > 1 ? "s" : ""} equipped`}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="text-white/30 hover:text-white/70 text-3xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            {/* Currently wearing strip */}
            <div className="mx-8 mb-4 rounded-2xl bg-white/5 border border-white/8 px-4 py-3 shrink-0">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
                Currently wearing
              </p>
              <div className="flex gap-3 items-center min-h-[32px]">
                {equippedCount > 0
                  ? (["outerwear", "top", "bottom"] as ItemCategory[])
                      .filter((cat) => equipped[cat])
                      .map((cat) => (
                        <span
                          key={cat}
                          className="text-2xl"
                          title={`${CATEGORY_LABELS[cat]}: ${equipped[cat]!.name}`}
                        >
                          {equipped[cat]!.emoji}
                        </span>
                      ))
                  : <span className="text-white/20 text-sm italic">Visit the wardrobe or dresser to get dressed!</span>
                }
              </div>
            </div>

            {/* Tab pills */}
            <div className="flex gap-2 px-8 pb-4 shrink-0 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all min-h-[32px] ${
                    activeTab === tab.id
                      ? "bg-summer-coral text-white"
                      : "bg-white/8 text-white/50 hover:bg-white/15 hover:text-white/80"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable item grid — read only, visit source to change */}
            <div className="overflow-y-auto px-8 pb-6">
              {categoriesToShow.map((cat) => {
                const items = grouped[cat];
                if (items.length === 0) return null;
                return (
                  <div key={cat} className="mb-5 last:mb-0">
                    {activeTab === "all" && (
                      <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
                        {CATEGORY_LABELS[cat]}
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      {items.map((item) => {
                        const active = isEquipped(item);
                        return (
                          <div
                            key={item.id}
                            className={`flex flex-col items-center gap-1 p-3 rounded-2xl border select-none ${
                              active
                                ? "bg-summer-coral/25 border-summer-coral/70 text-white"
                                : "bg-white/5 border-white/10 text-white/40"
                            }`}
                          >
                            <span className="text-2xl leading-none">{item.emoji}</span>
                            <span className="text-xs text-center leading-tight mt-1">
                              {item.name}
                            </span>
                            {active
                              ? <span className="text-[10px] text-summer-coral font-bold uppercase tracking-wider">On</span>
                              : <span className="text-[10px] text-white/20 uppercase tracking-wider">{CATEGORY_SOURCE[cat]}</span>
                            }
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hint footer */}
            <div className="px-8 pb-8 shrink-0">
              <p className="text-white/25 text-xs text-center italic">
                Visit the wardrobe or dresser to change clothes
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
