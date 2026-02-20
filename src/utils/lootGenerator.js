// src/utils/lootGenerator.js
import { 
  COMBINED_LOOT_TABLE, GEAR_TYPES, ITEM_CONDITIONS, ITEM_BRANDS, 
  GEAR_SUFFIXES, POISON_PARTS, GRENADE_PARTS 
} from '../data/lootTables';
import { WEAPONS, ARMOR } from '../data/gear'; 

const rollD20 = () => Math.floor(Math.random() * 20) + 1;
const rollD100 = () => Math.floor(Math.random() * 100) + 1;

export const generateProceduralLoot = () => {
  const masterRoll = rollD100();
  const lootData = COMBINED_LOOT_TABLE.find(l => masterRoll >= l.min && masterRoll <= l.max);
  
  const conditionRoll = rollD100();
  const itemCondition = ITEM_CONDITIONS[conditionRoll] || "Unknown";

  const brandRoll = rollD20();
  const itemBrand = ITEM_BRANDS.find(b => brandRoll >= b.min && brandRoll <= b.max)?.name || "Unknown";
  
  const suffixRoll = rollD20();
  const itemSuffix = GEAR_SUFFIXES[suffixRoll];

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
    const gearType = GEAR_TYPES.find(g => gearTypeRoll >= g.min && gearTypeRoll <= g.max);
    
    let baseFrame = { name: "Unknown Frame" };
    if (gearType.type === "Armor" && ARMOR && ARMOR.length > 0) {
      baseFrame = ARMOR[Math.floor(Math.random() * ARMOR.length)];
    } else if (WEAPONS && WEAPONS.length > 0) {
      const filteredWeapons = WEAPONS.filter(w => w.type === gearType.type);
      if (filteredWeapons.length > 0) {
        baseFrame = filteredWeapons[Math.floor(Math.random() * filteredWeapons.length)];
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

    // Correctly using bracket notation to access the string keys
    if (isGrenade) {
      finalItem.name = `${GRENADE_PARTS["1st"][p1]} ${GRENADE_PARTS["2nd"][p2]} Grenade of ${GRENADE_PARTS["3rd"][p3]}`;
    } else {
      finalItem.name = `${POISON_PARTS["1st"][p1]} ${POISON_PARTS["2nd"][p2]} Poison of ${POISON_PARTS["3rd"][p3]}`;
    }
  
  } else {
    finalItem.name = `Random ${resolvedCategory}`;
  }

  return finalItem;
};