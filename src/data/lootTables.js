// src/data/lootTables.js

export const LOOT_CATEGORIES = [
  { min: 1, max: 4, type: "Valuables" },
  { min: 5, max: 11, type: "Consumables" },
  { min: 12, max: 15, type: "Vestiges" },
  { min: 16, max: 20, type: "Gear" }
];

// RNG Weights for Loot Rarity
export const LOOT_TIERS = [
  { min: 1, max: 3, name: "Mundane I", color: "text-gray-400" },
  { min: 4, max: 10, name: "Ordinary II", color: "text-white" },
  { min: 11, max: 16, name: "Excellent III", color: "text-blue-400" },
  { min: 17, max: 19, name: "Masterful IV", color: "text-purple-500" },
  { min: 20, max: 20, name: "Legendary V", color: "text-yellow-500" }
];

// If the loot category rolls "Gear", roll to see what kind:
export const GEAR_TYPES = [
  { min: 1, max: 8, type: "Melee Weapon" },
  { min: 9, max: 16, type: "Ranged Weapon" },
  { min: 17, max: 20, type: "Armor" }
];

export const ITEM_CONDITIONS = {
  1: "Dangerous", 2: "Broken", 3: "Slimy", 4: "Foul smelling", 5: "Unreliable", 
  6: "Fragile", 7: "Inefficient", 8: "Loud", 9: "High maintenance", 10: "Simple", 
  11: "Dusty", 12: "Conspicuous", 13: "Horrific", 14: "Narrow", 15: "Rotten", 
  16: "Nasty", 17: "Corrupted", 18: "Corroded", 19: "Dull", 20: "Bulky", 
  21: "Colorful", 22: "Raised", 23: "Oily", 24: "Balanced", 25: "Gets hot", 
  26: "Rugged", 27: "Small", 28: "Short", 29: "Neat", 30: "Cold", 
  31: "Convenient", 32: "Fossilized", 33: "Peculiar", 34: "Twin", 35: "Thin", 
  36: "Angular", 37: "Long", 38: "Satanic", 39: "Effective", 40: "Remarkable", 
  41: "Graceful", 42: "Great", 43: "Sparkling", 44: "Heavy", 45: "Tactical", 
  46: "Oozing", 47: "Fast", 48: "Murmuring", 49: "Sticky", 50: "Quiet", 
  51: "Profound", 52: "Beeping", 53: "Transparent", 54: "Breathing", 55: "Transmitting", 
  56: "Glowing", 57: "Contorting", 58: "Inconspicuous", 59: "Recording", 60: "Watching", 
  61: "Burning", 62: "Talking", 63: "Helpful", 64: "Impressive", 65: "Very intelligent", 
  66: "Sharp", 67: "Pulsating", 68: "Devious", 69: "Crystalline", 70: "Hardened", 
  71: "Fiery", 72: "Translucent", 73: "Thunderous", 74: "Strong", 75: "Dark", 
  76: "Crackling", 77: "Twisting", 78: "Infested", 79: "Cultural", 80: "Precious", 
  81: "Fanged", 82: "Shiny", 83: "Thin", 84: "Ghastly", 85: "Raven", 
  86: "Brilliant", 87: "Decorative", 88: "Poisonous", 89: "Smoking", 90: "Translucent", 
  91: "Self-cleaning", 92: "Impressive", 93: "Luxurious", 94: "Advanced", 95: "Soothing", 
  96: "Large", 97: "Renowned", 98: "Stealthy", 99: "Smart", 100: "Evil"
};

// The Master d100 Combined Loot & Tier Table
export const COMBINED_LOOT_TABLE = [
  { min: 1, max: 3, tier: "Mundane I", category: "Valuables", color: "text-gray-400" },
  { min: 4, max: 8, tier: "Mundane I", category: "Consumables", color: "text-gray-400" },
  { min: 9, max: 11, tier: "Mundane I", category: "Vestiges", color: "text-gray-400" },
  { min: 12, max: 15, tier: "Mundane I", category: "Gear", color: "text-gray-400" },
  
  { min: 16, max: 22, tier: "Ordinary II", category: "Valuables", color: "text-white" },
  { min: 23, max: 34, tier: "Ordinary II", category: "Consumables", color: "text-white" },
  { min: 35, max: 41, tier: "Ordinary II", category: "Vestiges", color: "text-white" },
  { min: 42, max: 50, tier: "Ordinary II", category: "Gear", color: "text-white" },
  
  { min: 51, max: 56, tier: "Excellent III", category: "Valuables", color: "text-blue-400" },
  { min: 57, max: 66, tier: "Excellent III", category: "Consumables", color: "text-blue-400" },
  { min: 67, max: 72, tier: "Excellent III", category: "Vestiges", color: "text-blue-400" },
  { min: 73, max: 80, tier: "Excellent III", category: "Gear", color: "text-blue-400" },
  
  { min: 81, max: 83, tier: "Masterful IV", category: "Valuables", color: "text-purple-500" },
  { min: 84, max: 88, tier: "Masterful IV", category: "Consumables", color: "text-purple-500" },
  { min: 89, max: 91, tier: "Masterful IV", category: "Vestiges", color: "text-purple-500" },
  { min: 92, max: 95, tier: "Masterful IV", category: "Gear", color: "text-purple-500" },
  
  { min: 96, max: 97, tier: "Legendary V", category: "Valuables", color: "text-yellow-500" },
  { min: 98, max: 99, tier: "Legendary V", category: "Consumables", color: "text-yellow-500" },
  { min: 100, max: 100, tier: "Legendary V", category: "Vestige or Gear", color: "text-yellow-500" } 
];