// combatEngine.js - The Brain of the Aether Economy
// Connects Forms, Destinies, and Weapons to the Blackjack Engine

/**
 * Calculates the Roll-Under Target.
 * A roll equal to or lower than this number is a SUCCESS.
 */
export const calculateRollTarget = (character, weapon, skillName, FORMS, DESTINIES) => {
  const form = FORMS.find(f => f.name === character.form);
  const destiny = DESTINIES.find(d => d.name === character.destiny);
  
  if (!form) return 10; // Fallback safety

  // 1. Get Base Stat (e.g., SPD for Precision, PHY for Melee)
  const baseStatValue = skillName === 'Precision' ? form.baseStats.SPD : form.baseStats.PHY;

  // 2. Add Weapon Accuracy (att) from your WEAPON_TABLE
  const weaponBonus = weapon.stats?.att || 0;

  // 3. Add Destiny Skill Bonuses (e.g., +5 from Destiny specializations)
  const destinyBonus = (destiny?.bonuses?.[skillName.toLowerCase()] || 0);

  // Result: If a Satanic Entity (25 PHY) uses a +1 Axe, Target is 26.
  return baseStatValue + weaponBonus + destinyBonus;
};

/**
 * Calculates the "Hot Streak" (Crit) range.
 * Instead of just rolling a 1, powerful gear expands this window.
 */
export const getCritRange = (character, weapon) => {
  let range = 1; // Default: Crit only on a natural 1

  // Expand window if Weapon is Ancient or Void-Forged
  if (weapon.origin === "Ancient") range += 2; 
  if (weapon.origin === "Void-Forged") range += 4;

  // Expand window if Character has the "Ancients" origin power
  if (character.backstory?.origin === "The Ancients") range += 1;

  return range; // Returns max number for a "Hot Streak" (e.g., 1-5)
};
