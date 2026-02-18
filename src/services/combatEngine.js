// src/services/combatEngine.js
// The Brain of the Aether Economy

/**
 * Calculates the "Hot Streak" (Crit) range.
 * Instead of just rolling a 1, powerful gear expands this window.
 */
export const getCritRange = (character, equippedWeaponString) => {
  let range = 1; // Default: Crit only on a natural 1

  // Expand window based on the Equipped Weapon string
  if (equippedWeaponString) {
      if (equippedWeaponString.includes("Ancient")) range += 2; // Crits on 1, 2, 3
      if (equippedWeaponString.includes("Void-Forged")) range += 4; // Crits on 1-5
  }

  // Expand window if Character has a specific Master/Origin
  if (character.master && character.master.includes("The Ancients")) {
      range += 1;
  }

  return range; // Returns max number for a "Hot Streak"
};

/**
 * Calculates total weapon accuracy bonus
 */
export const getWeaponAccuracy = (equippedWeaponString, getGearStats) => {
    if (!equippedWeaponString) return 0;
    const stats = getGearStats(equippedWeaponString);
    return stats && !stats.isArmor ? (stats.stats.att || 0) : 0;
};