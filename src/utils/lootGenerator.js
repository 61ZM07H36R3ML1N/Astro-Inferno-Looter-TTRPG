import { COMBINED_LOOT_TABLE, GEAR_TYPES, ITEM_CONDITIONS, ITEM_BRANDS } from '../data/lootTables';
import { WEAPONS, ARMOR } from '../data/gear'; 

const rollD20 = () => Math.floor(Math.random() * 20) + 1;
const rollD100 = () => Math.floor(Math.random() * 100) + 1;

export const generateProceduralLoot = () => {
  // 1. Master Roll for Category and Tier
  const masterRoll = rollD100();
  const lootData = COMBINED_LOOT_TABLE.find(l => masterRoll >= l.min && masterRoll <= l.max);
  
  // 2. Roll for Physical Condition
  const conditionRoll = rollD100();
  const itemCondition = ITEM_CONDITIONS[conditionRoll] || "Unknown";

  // 3. Roll for the Brand / Origin
  const brandRoll = rollD20();
  const itemBrand = ITEM_BRANDS.find(b => brandRoll >= b.min && brandRoll <= b.max).name;

  let resolvedCategory = lootData.category;
  if (resolvedCategory === "Vestige or Gear") {
    resolvedCategory = Math.random() > 0.5 ? "Gear" : "Vestiges";
  }

  let finalItem = {
    category: resolvedCategory,
    tier: lootData.tier,
    color: lootData.color,
    condition: itemCondition,
    brand: itemBrand, // <-- Brand assigned!
    name: "Unknown Item",
    stats: {}
  };

  // 4. Build the Procedural Item
  if (resolvedCategory === "Gear") {
    const gearTypeRoll = rollD20();
    const gearType = GEAR_TYPES.find(g => gearTypeRoll >= g.min && gearTypeRoll <= g.max);
    
    let baseFrame;
    if (gearType.type === "Armor") {
      baseFrame = ARMOR[Math.floor(Math.random() * ARMOR.length)];
    } else {
      const filteredWeapons = WEAPONS.filter(w => w.type === gearType.type);
      baseFrame = filteredWeapons[Math.floor(Math.random() * filteredWeapons.length)];
    }

    // Combine the Brand and the Base Item Name!
    // Example: "Genesis Combat Shotgun"
    let itemName = `${itemBrand} ${baseFrame.name}`;
    
    finalItem.name = itemName;
    finalItem.stats = { ...baseFrame }; 
  } else if (resolvedCategory === "Vestiges") {
    finalItem.name = `${itemBrand} Vestige`;
  } else {
    finalItem.name = `Random ${resolvedCategory}`;
  }

  return finalItem;
};