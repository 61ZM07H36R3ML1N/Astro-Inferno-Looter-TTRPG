import { COMBINED_LOOT_TABLE, GEAR_TYPES, ITEM_CONDITIONS } from '../data/lootTables';
import { WEAPONS, ARMOR } from '../data/gear'; 

const rollD20 = () => Math.floor(Math.random() * 20) + 1;
const rollD100 = () => Math.floor(Math.random() * 100) + 1;

export const generateProceduralLoot = () => {
  // 1. One Master Roll for Category and Tier
  const masterRoll = rollD100();
  const lootData = COMBINED_LOOT_TABLE.find(l => masterRoll >= l.min && masterRoll <= l.max);
  
  // 2. Roll for the Item's Physical Condition
  const conditionRoll = rollD100();
  const itemCondition = ITEM_CONDITIONS[conditionRoll] || "Unknown";

  // Handle the special 100 roll split (50/50 chance of Vestige or Gear)
  let resolvedCategory = lootData.category;
  if (resolvedCategory === "Vestige or Gear") {
    resolvedCategory = Math.random() > 0.5 ? "Gear" : "Vestiges";
  }

  let finalItem = {
    category: resolvedCategory,
    tier: lootData.tier,
    color: lootData.color,
    condition: itemCondition,
    name: "Unknown Item",
    stats: {}
  };

  // 3. If it's Gear, build the procedural weapon/armor
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

    // Assign the Base Frame Name and Stats
    let itemName = baseFrame.name;
    
    // NOTE: Once you drop the Genesis/Satanic prefixes and suffixes, 
    // we will inject the logic right here to attach them to the itemName!
    
    finalItem.name = itemName;
    finalItem.stats = { ...baseFrame }; 
  } else {
    // If it's a Consumable, Valuable, or Vestige
    finalItem.name = `Random ${resolvedCategory}`;
  }

  return finalItem;
};