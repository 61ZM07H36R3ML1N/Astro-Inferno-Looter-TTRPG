// src/utils/lootGenerator.js
// src/utils/lootGenerator.js
// Only importing the tables we KNOW exist in your app!
import { 
  COMBINED_LOOT_TABLE, GEAR_TYPES, POISON_PARTS, GRENADE_PARTS 
} from '../data/lootTables';
import { WEAPON_TABLE } from '../data/gear'; 

// --- INTERNAL FLAVOR TABLES ---
// We brought these inside the generator so they never crash your imports!
const ITEM_CONDITIONS = ["Pristine", "Scuffed", "Blood-Stained", "Scorched", "Flawless", "Worn", "Rusted", "Irradiated"];
const ITEM_BRANDS = ["Mil-Spec", "Scrap-Built", "VoidTech", "AstroForge", "Genesis", "Black Market", "Romaine Electric"];
const GEAR_SUFFIXES = ["the Void", "Carnage", "Euphoria", "Despair", "the Ancients", "Ruin", "Blood", "Ash", "Silence", "Echoes"];

const ARMOR_FRAMES = [
  { name: "Light Armor" }, 
  { name: "Heavy Armor" }, 
  { name: "Tactical Armor" },
  { name: "Hazard Armor" }
];

const rollD20 = () => Math.floor(Math.random() * 20) + 1;
const rollD100 = () => Math.floor(Math.random() * 100) + 1;

export const generateProceduralLoot = () => {
  const masterRoll = rollD100();
  // Fallback added just in case the roll somehow misses
  const lootData = COMBINED_LOOT_TABLE.find(l => masterRoll >= l.min && masterRoll <= l.max) || { category: "Gear", tier: "Standard II", color: "text-gray-300" };
  
  // Simplified math to grab random flavor texts
  const itemCondition = ITEM_CONDITIONS[Math.floor(Math.random() * ITEM_CONDITIONS.length)];
  const itemBrand = ITEM_BRANDS[Math.floor(Math.random() * ITEM_BRANDS.length)];
  const itemSuffix = GEAR_SUFFIXES[Math.floor(Math.random() * GEAR_SUFFIXES.length)];

  let resolvedCategory = lootData.category;
  if (resolvedCategory === "Vestige or Gear") {
    resolvedCategory = Math.random() > 0.5 ? "Gear" : "Vestiges";
  }

  let finalItem = {
    category: resolvedCategory,
    tier: lootData.tier,
    color: lootData.color,
    condition: itemCondition,
    brand: itemBrand, 
    name: "Unknown Item",
    stats: {}
  };

  if (resolvedCategory === "Gear") {
    const gearTypeRoll = rollD20();
    const gearType = GEAR_TYPES.find(g => gearTypeRoll >= g.min && gearTypeRoll <= g.max) || { type: "Melee" };
    
    let baseFrame = { name: "Unknown Frame" };
    
    if (gearType.type === "Armor") {
      baseFrame = ARMOR_FRAMES[Math.floor(Math.random() * ARMOR_FRAMES.length)];
    } else if (WEAPON_TABLE && WEAPON_TABLE.length > 0) {
      const filteredWeapons = WEAPON_TABLE.filter(w => w.type === gearType.type);
      if (filteredWeapons.length > 0) {
        baseFrame = filteredWeapons[Math.floor(Math.random() * filteredWeapons.length)];
      } else {
        baseFrame = WEAPON_TABLE[Math.floor(Math.random() * WEAPON_TABLE.length)];
      }
    }

    let itemName = `${itemBrand} ${baseFrame.name}`;
    if (["Excellent III", "Masterful IV", "Legendary V"].includes(lootData.tier)) {
      itemName += ` of ${itemSuffix}`;
    }
    
    finalItem.name = itemName;
    finalItem.stats = { ...baseFrame }; 

  } else if (resolvedCategory === "Vestiges") {
    let vestigeName = `${itemBrand} Vestige`;
    if (["Excellent III", "Masterful IV", "Legendary V"].includes(lootData.tier)) {
      vestigeName += ` of ${itemSuffix}`;
    }
    finalItem.name = vestigeName;

  } else if (resolvedCategory === "Consumables") {
    const isGrenade = Math.random() > 0.5;
    const p1 = rollD20() - 1;
    const p2 = rollD20() - 1;
    const p3 = rollD20() - 1;

    // Added fallbacks here just in case the d20 rolls out of bounds of your arrays
    if (isGrenade) {
      finalItem.name = `${GRENADE_PARTS["1st"][p1] || "Scrap"} ${GRENADE_PARTS["2nd"][p2] || "Incendiary"} Grenade of ${GRENADE_PARTS["3rd"][p3] || "Blast"}`;
    } else {
      finalItem.name = `${POISON_PARTS["1st"][p1] || "Toxic"} ${POISON_PARTS["2nd"][p2] || "Sludge"} Poison of ${POISON_PARTS["3rd"][p3] || "Death"}`;
    }
  
  } else {
    finalItem.name = `Random ${resolvedCategory}`;
  }

  return finalItem;
};