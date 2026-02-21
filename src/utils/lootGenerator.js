// src/utils/lootGenerator.js

// Now we only import the bare minimum core tables that we KNOW exist
import { COMBINED_LOOT_TABLE, GEAR_TYPES } from '../data/lootTables';
import { WEAPON_TABLE } from '../data/gear'; 

// --- INTERNAL FLAVOR TABLES (Self-Contained to prevent crashes) ---
const ITEM_CONDITIONS = ["Pristine", "Scuffed", "Blood-Stained", "Scorched", "Flawless", "Worn", "Rusted", "Irradiated"];
const ITEM_BRANDS = ["Mil-Spec", "Scrap-Built", "VoidTech", "AstroForge", "Genesis", "Black Market", "Romaine Electric"];
const GEAR_SUFFIXES = ["the Void", "Carnage", "Euphoria", "Despair", "the Ancients", "Ruin", "Blood", "Ash", "Silence", "Echoes"];

const ARMOR_FRAMES = [
  { name: "Light Armor" }, { name: "Heavy Armor" }, { name: "Tactical Armor" }, { name: "Hazard Armor" }
];

const POISON_PARTS = {
  "1st": ["Blazing", "Boiling", "Crippling", "Cursed", "Delirious", "Delicious", "Digital", "Dry", "Elderitch", "Luminous", "Nano", "Ominious", "Psychic", "Radiating", "Rapid", "Slow", "Spiritual", "Silent", "Wet", "Withering"],
  "2nd": ["Anchored", "Blackened", "Blinding", "Commanding", "Corrosive", "Crawling", "Dazzling", "Floating", "Frenzied", "Growing", "Haunting", "Infectious", "Living", "Morphing", "Multitasking", "Paralyzing", "Sparkling", "Unbearable", "Vile", "Whispering"],
  "3rd": ["Amnesia", "Attraction", "Bleeding", "Blindness", "Boiling", "Confusion", "Decay", "Diarrhea", "Disease", "Rupture", "Insanity", "Insomnia", "Mirage", "Nausea", "Nightmare", "Pain", "Possession", "Rage", "Seizure", "Weakness"]
};

const GRENADE_PARTS = {
  "1st": ["Abyssal", "Crystal", "Dangerous", "Demonic", "Divine", "Dreamy", "Fuse", "Genesis", "Glass", "Ice", "Liquid", "Living", "Metal", "Organ", "Paper", "Powered", "Psychic", "Reflective", "Scrap", "Wooden"],
  "2nd": ["Blinding", "Corroding", "Collateral", "Dazzling", "Deafening", "Distant", "Electric", "Entangling", "Gravity", "Impaling", "Lingering", "Magnetizing", "Paralyzing", "Penetrating", "Shattering", "Silencing", "Slumbering", "Steaming", "Sticking", "Triggered"],
  "3rd": ["Blast", "Blood", "Death", "Dirt", "Fire", "Flesh", "Gas", "Gate", "Holtzfield", "Infection", "Light", "Poison", "Radiation", "Slime", "Smoke", "Tar", "Tendrils", "Trap", "Venom", "Water"]
};

const rollD20 = () => Math.floor(Math.random() * 20) + 1;
const rollD100 = () => Math.floor(Math.random() * 100) + 1;

export const generateProceduralLoot = () => {
  const masterRoll = rollD100();
  // Safe fallback if the table roll misses
  const lootData = COMBINED_LOOT_TABLE?.find(l => masterRoll >= l.min && masterRoll <= l.max) || { category: "Gear", tier: "Standard II", color: "text-gray-300" };
  
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
    const gearType = GEAR_TYPES?.find(g => gearTypeRoll >= g.min && gearTypeRoll <= g.max) || { type: "Melee" };
    
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