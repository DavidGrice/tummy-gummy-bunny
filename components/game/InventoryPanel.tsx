"use client";

import { useRef, useState } from "react";
import { usePreviewRenderer } from "@/hooks/usePreviewRenderer";
import { WARDROBE_ITEMS, DRESSER_ITEMS } from "@/lib/inventory";
import type { InventoryItem, ItemCategory } from "@/lib/inventory";
import type { EquippedItems } from "@/hooks/useInventory";

export type InventorySource = "wardrobe" | "dresser";

type Tab = "outerwear" | "top" | "bottom";

const SOURCE_TABS: Record<InventorySource, Tab[]> = {
  wardrobe: ["outerwear"],
  dresser:  ["top", "bottom"],
};

const TAB_LABELS: Record<Tab, string> = {
  outerwear: "Outerwear",
  top:       "Tops",
  bottom:    "Bottoms",
};

interface Props {
  source:    InventorySource;
  equipped:  EquippedItems;
  onEquip:   (item: InventoryItem) => void;
  onUnequip: (category: ItemCategory) => void;
  onClose:   () => void;
}

export function InventoryPanel({ source, equipped, onEquip, onUnequip, onClose }: Props) {
  const previewRef  = useRef<HTMLCanvasElement>(null);
  const availTabs   = SOURCE_TABS[source];
  const [activeTab, setActiveTab] = useState<Tab>(availTabs[0]);

  // Live 3-D preview of the bunny in the panel canvas
  usePreviewRenderer(previewRef, equipped);

  const allItems  = source === "wardrobe" ? WARDROBE_ITEMS : DRESSER_ITEMS;
  const tabItems  = allItems.filter((i) => i.category === activeTab);
  const isEquip   = (item: InventoryItem) => equipped[item.category]?.id === item.id;

  function handleItem(item: InventoryItem) {
    if (isEquip(item)) onUnequip(item.category);
    else onEquip(item);
  }

  const sourceTitle = source === "wardrobe" ? "🧥 Wardrobe" : "🗄️ Dresser";

  return (
    <div className="absolute inset-0 z-40 flex">

      {/* Left: dim backdrop over the game — click to close */}
      <div
        className="flex-1 bg-black/30 cursor-pointer"
        onClick={onClose}
        aria-label="Close panel"
      />

      {/* Right: dressing-room panel */}
      <div className="w-[45%] min-w-[260px] flex flex-col bg-gray-900/90 backdrop-blur-md border-l border-white/10 shadow-[-8px_0_32px_rgba(0,0,0,0.5)]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-3 shrink-0">
          <h2 className="text-summer-cream font-black text-lg uppercase tracking-widest">
            {sourceTitle}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white/30 hover:text-white/70 text-3xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* 3-D preview canvas */}
        <div className="px-4 pb-1 shrink-0">
          <div className="rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-b from-gray-800/60 to-gray-900/60">
            <canvas
              ref={previewRef}
              className="w-full h-40 sm:h-52 block"
            />
          </div>
          <p className="text-white/25 text-[10px] text-center mt-1.5 italic tracking-wide">
            Live preview · tap an item below to try it on
          </p>
        </div>

        {/* Tab pills (only shown if source has more than one tab) */}
        {availTabs.length > 1 && (
          <div className="flex gap-2 px-4 py-3 shrink-0">
            {availTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all min-h-[32px] ${
                  activeTab === tab
                    ? "bg-summer-coral text-white"
                    : "bg-white/8 text-white/50 hover:bg-white/15 hover:text-white/80"
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        )}

        {/* Item grid — scrollable, single column so text always fits */}
        <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
          {availTabs.length === 1 && (
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
              {TAB_LABELS[activeTab]}
            </p>
          )}
          <div className="flex flex-col gap-2">
            {tabItems.map((item) => {
              const active = isEquip(item);
              return (
                <button
                  key={item.id}
                  onClick={() => handleItem(item)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all min-h-[56px] text-left overflow-hidden ${
                    active
                      ? "bg-summer-coral/25 border-summer-coral/70 text-white"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/25"
                  }`}
                >
                  <span className="text-3xl leading-none shrink-0" aria-hidden>{item.emoji}</span>
                  <span className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-bold leading-tight truncate">{item.name}</span>
                    {active && (
                      <span className="text-[10px] text-summer-coral font-black uppercase tracking-wider mt-0.5 whitespace-nowrap">
                        ● Wearing
                      </span>
                    )}
                  </span>
                  {active && (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-summer-coral" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Done */}
        <div className="px-4 pb-6 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-summer-coral text-white font-black uppercase tracking-widest text-sm min-h-[44px] hover:brightness-110 transition-all active:scale-95"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
