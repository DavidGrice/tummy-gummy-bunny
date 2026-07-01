/**
 * Tummy Gummy Bunny — canonical colour palette.
 *
 * Single source of truth for all hex colours in room manifests and
 * materialOverrides. Colours are derived from the actual GLB baseColorFactor
 * values so the procedural fallbacks match the authored materials.
 *
 * Usage:
 *   import { PALETTE } from "@/lib/palette";
 *   materialOverrides: { Chair_Light_Wood: PALETTE.woodLight }
 */
export const PALETTE = {

  // ── Wood — darkest to lightest ────────────────────────────────────────────
  /** Deepest foot / leg shadow — armchair legs, sideboard feet      GLB: Leg_DarkWalnut, Sideboard_Leg */
  woodBlack:       0x170D08,
  /** Rich espresso — sideboard walnut body, vanity walnut           GLB: Sideboard_Walnut, Vanity_Walnut_Body */
  woodEspresso:    0x331F14,
  /** Dark walnut — armchair frame, parents bed frame                GLB: Frame_MediumBrown, Bed_FrameWood */
  woodWalnut:      0x4D2E1A,
  /** Deep brown — doors, dark-stained furniture (procedural base)   */
  woodDark:        0x5C3D1E,
  /** Warm mahogany — general furniture procedural fallback           */
  woodMahogany:    0x6B4423,
  /** Warm mid-brown — general room furniture, dining set wood tone   */
  woodWarm:        0x7A5230,
  /** Cherry — china cabinet body                                    GLB: China_Cherry_Wood */
  woodCherry:      0x8C471F,
  /** Saddle — bed wood frame, warm mid-tone                         GLB: Wood (bunny_bed) */
  woodSaddle:      0x8C4512,
  /** Warm light wood — dining chairs, neighbourhood bench           GLB: Chair_Light_Wood, Bench_Light_Wood */
  woodLight:       0xB89970,
  /** Whitewash — dining table top surface                           GLB: Table_Whitewash_Wood */
  woodWhitewash:   0xCCC4B5,

  // ── Upholstery & soft furnishings ─────────────────────────────────────────
  /** Warm cream — chair / bench fabric, light upholstery            GLB: Chair_Cream_Fabric, Bench_Cream_Fabric */
  fabricCream:     0xDBD1BD,
  /** Warm linen — mattress, bedding                                 GLB: Bed_MattressFabric */
  fabricLinen:     0xEBE8DE,
  /** Sandy beige — room prop fallback / soft items                  */
  fabricSand:      0xC8B898,
  /** Aged parchment — lamp shades, warm-white cloth                 GLB: LampShadeFabric, WallLamp_ShadeFabric */
  fabricParchment: 0xF2E5C7,
  /** Taupe button — upholstery buttons, muted fabric accents        GLB: Chair_Button */
  fabricTaupe:     0x8C806B,
  /** Cushion tan — armchair seat cushion                            GLB: Cushion_Tan */
  cushionTan:      0x855933,

  // ── Stone, ceramic & glass ────────────────────────────────────────────────
  /** Honed stone — vanity countertop                                GLB: Vanity_Countertop_Stone */
  stone:           0xDBD9D1,
  /** Bathroom ceramic — sink, tub, toilet                           GLB: Sink/Tub/Toilet_Ceramic */
  ceramic:         0xF5F5F2,
  /** Glass teal — china cabinet glass panels                        GLB: China_Glass */
  glassBlue:       0xBFD9D9,

  // ── Metals ────────────────────────────────────────────────────────────────
  /** Polished chrome — bathroom taps, faucets                       GLB: Sink/Tub/Toilet_Chrome */
  chrome:          0xD9DEE5,
  /** Pewter — dining table bracket hardware                         GLB: Table_Hardware_Pewter */
  pewter:          0x59595C,
  /** Antique brass — wardrobe door handles                          GLB: Handle.001 (wardrobe) */
  brass:           0x998033,
  /** Warm gold — dresser handles, cabinet accent hardware           GLB: Handle.001 (dresser) */
  gold:            0xCCB866,
  /** Aged bronze — journal lettering, pull hardware                 GLB: Journal_GoldText, China_Pull_Bronze */
  bronze:          0x8C6624,
  /** Brushed nickel — vanity knobs                                  GLB: Vanity_Knob_Nickel */
  nickel:          0x8C8C91,

  // ── Room surfaces ─────────────────────────────────────────────────────────
  /** Warm buttercream — tutorial bedroom wall, hallway wall          */
  wallWarm:        0xEDD9B4,
  /** Warm stone — dining room wall, kitchen wall                    */
  wallStone:       0xE8D8B0,
  /** Oak parquet — tutorial bedroom floor                           */
  floorOak:        0xC8A878,
  /** Dark mahogany — dining & living room floors                    */
  floorMahogany:   0xA07850,
  /** Street pavement — neighbourhood                                */
  floorPavement:   0x787060,

  // ── Accent colours ────────────────────────────────────────────────────────
  /** Sage green — bed blanket, soft nature accents                  */
  sageGreen:       0x5C8A50,
  /** Map red — pin & red-X on the house map                         GLB: Map_RedX */
  mapRed:          0x8C0A08,

} as const;

export type PaletteKey = keyof typeof PALETTE;
