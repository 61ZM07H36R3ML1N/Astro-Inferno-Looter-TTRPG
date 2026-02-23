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

// Master Suffix List (d20 Roll) - Added to high-tier gear and vestiges
export const GEAR_SUFFIXES = {
  1: "Appearance", 2: "Aura", 3: "Charm", 4: "Dreams", 5: "Drive",
  6: "Element", 7: "Emotions", 8: "Euphoria", 9: "Focus", 10: "Health",
  11: "Leadership", 12: "Mind", 13: "Motivation", 14: "Morality", 15: "Movement",
  16: "Restoration", 17: "Sense", 18: "Shape", 19: "Strength", 20: "Travel"
};

// Procedural Consumables: POISONS (d20 Rolls)
export const POISON_PARTS = {
  part1: ["Blazing", "Boiling", "Crippling", "Cursed", "Delirious", "Delicious", "Digital", "Dry", "Elderitch", "Luminous", "Nano", "Ominious", "Psychic", "Radiating", "Rapid", "Slow", "Spiritual", "Silent", "Wet", "Withering"],
  part2: ["Anchored", "Blackened", "Blinding", "Commanding", "Corrosive", "Crawling", "Dazzling", "Floating", "Frenzied", "Growing", "Haunting", "Infectious", "Living", "Morphing", "Multitasking", "Paralyzing", "Sparkling", "Unbearable", "Vile", "Whispering"],
  part3: ["Amnesia", "Attraction", "Bleeding", "Blindness", "Boiling", "Confusion", "Decay", "Diarrhea", "Disease", "Rupture", "Insanity", "Insomnia", "Mirage", "Nausea", "Nightmare", "Pain", "Possession", "Rage", "Seizure", "Weakness"]
};

// Procedural Consumables: GRENADES (d20 Rolls)
export const GRENADE_PARTS = {
  part1: ["Abyssal", "Crystal", "Dangerous", "Demonic", "Divine", "Dreamy", "Fuse", "Genesis", "Glass", "Ice", "Liquid", "Living", "Metal", "Organ", "Paper", "Powered", "Psychic", "Reflective", "Scrap", "Wooden"],
  part2: ["Blinding", "Corroding", "Collateral", "Dazzling", "Deafening", "Distant", "Electric", "Entangling", "Gravity", "Impaling", "Lingering", "Magnetizing", "Paralyzing", "Penetrating", "Shattering", "Silencing", "Slumbering", "Steaming", "Sticking", "Triggered"],
  part3: ["Blast", "Blood", "Death", "Dirt", "Fire", "Flesh", "Gas", "Gate", "Holtzfield", "Infection", "Light", "Poison", "Radiation", "Slime", "Smoke", "Tar", "Tendrils", "Trap", "Venom", "Water"]
};

export const weaponPrefixes = [
  { id: "pfx_limbonian", name: "Limbonian", att: 0, agm: 0, dmg: 1, tgt: 0, grade: -2 },
  { id: "pfx_babylonian", name: "Babylonian", att: 4, agm: 0, dmg: 0, tgt: 0, grade: 2 },
  { id: "pfx_legion", name: "Legion", att: -3, agm: -3, dmg: 1, tgt: 0, grade: 0 },
  { id: "pfx_sinful", name: "Sinful", att: 0, agm: 0, dmg: 0, tgt: 1, grade: 1 },
  { id: "pfx_conquistador", name: "Conquistador", att: 2, agm: 3, dmg: 0, tgt: 0, grade: 2 },
  { id: "pfx_myrkheim", name: "Myrkheim", att: 0, agm: 0, dmg: 0, tgt: 2, grade: 1 },
  { id: "pfx_elysian", name: "Elysian", att: 0, agm: 3, dmg: 0, tgt: 1, grade: 0 },
  { id: "pfx_asgardian", name: "Asgardian", att: 2, agm: 0, dmg: 0, tgt: 1, grade: 0 },
  { id: "pfx_cerberus", name: "Cerberus", att: 0, agm: 0, dmg: 1, tgt: 1, grade: 1 },
  { id: "pfx_titan", name: "Titan", att: 3, agm: 3, dmg: 0, tgt: 0, grade: 0 },
  { id: "pfx_eden", name: "Eden", att: 5, agm: 5, dmg: 0, tgt: -1, grade: 0 },
  { id: "pfx_ghost", name: "Ghost", att: 2, agm: 2, dmg: 0, tgt: 1, grade: 0 },
  { id: "pfx_bloodyarn", name: "Blood yarn", att: 6, agm: 6, dmg: -1, tgt: 0, grade: 0 },
  { id: "pfx_evolving", name: "Evolving", att: 4, agm: 0, dmg: 0, tgt: 0, grade: 1 },
  { id: "pfx_divine", name: "Divine", att: 4, agm: 4, dmg: 0, tgt: 0, grade: 0 },
  { id: "pfx_flesh", name: "Flesh", att: -4, agm: 0, dmg: 1, tgt: 0, grade: 0 },
  { id: "pfx_haxan", name: "Haxan", att: 0, agm: -5, dmg: 1, tgt: 0, grade: 1 },
  { id: "pfx_inquisition", name: "Inquisition", att: 0, agm: -5, dmg: 1, tgt: 0, grade: 0 },
  { id: "pfx_blackened", name: "Blackened", att: 0, agm: 0, dmg: 2, tgt: -3, grade: 0 },
  { id: "pfx_abyssal", name: "Abyssal", att: 0, agm: 0, dmg: 1, tgt: -1, grade: 0 }
];

export const meleeWeapons = [
  // FINESSE
  { id: "wpn_dagger", skill: "Finesse", name: "Dagger", att: 1, agm: 5, dmg: 0, tgt: 0, grade: -2 },
  { id: "wpn_spear", skill: "Finesse", name: "Spear", att: 3, agm: 0, dmg: 0, tgt: 0, grade: -1 },
  { id: "wpn_whip", skill: "Finesse", name: "Whip", att: 5, agm: 0, dmg: -1, tgt: 2, grade: 0 },
  { id: "wpn_flail", skill: "Finesse", name: "Flail", att: 5, agm: -5, dmg: 0, tgt: 1, grade: 0 },
  { id: "wpn_scimitar", skill: "Finesse", name: "Scimitar", att: 1, agm: 0, dmg: 0, tgt: 0, grade: 0 },
  { id: "wpn_trident", skill: "Finesse", name: "Trident", att: 0, agm: 5, dmg: 0, tgt: 0, grade: 3 },

  // SLASHING
  { id: "wpn_crowbar", skill: "Slashing", name: "Crowbar", att: 3, agm: 0, dmg: 0, tgt: -1, grade: -1 },
  { id: "wpn_sword", skill: "Slashing", name: "Sword", att: -4, agm: 0, dmg: 0, tgt: "*2", grade: 0 },
  { id: "wpn_blade", skill: "Slashing", name: "Blade", att: 0, agm: 3, dmg: -1, tgt: "*2", grade: 0 },
  { id: "wpn_katana", skill: "Slashing", name: "Katana", att: 0, agm: 0, dmg: -1, tgt: "*2.5", grade: 0 },
  { id: "wpn_cleaver", skill: "Slashing", name: "Cleaver", att: 3, agm: 0, dmg: -1, tgt: "*2", grade: 0 },
  { id: "wpn_scythe", skill: "Slashing", name: "Scythe", att: 0, agm: 0, dmg: -1, tgt: "*2", grade: 3 },
  { id: "wpn_axe", skill: "Slashing", name: "Axe", att: 0, agm: 0, dmg: 0, tgt: "*1.5**", grade: 0 },
  { id: "wpn_saw", skill: "Slashing", name: "Saw", att: -4, agm: -4, dmg: 0, tgt: "*2", grade: 0 },

  // CRUSHING
  { id: "wpn_great_flail", skill: "Crushing", name: "Great flail", att: -6, agm: -6, dmg: 1, tgt: 1, grade: 0 },
  { id: "wpn_great_spear", skill: "Crushing", name: "Great spear", att: -9, agm: 4, dmg: 1, tgt: 1, grade: 1 },
  { id: "wpn_great_sword", skill: "Crushing", name: "Great sword", att: 0, agm: 0, dmg: 2, tgt: -1, grade: 1 },
  { id: "wpn_great_hammer", skill: "Crushing", name: "Great hammer", att: 3, agm: 0, dmg: 2, tgt: -2, grade: 1 },
  { id: "wpn_great_axe", skill: "Crushing", name: "Great axe", att: 0, agm: 5, dmg: 2, tgt: -2, grade: 1 },
  { id: "wpn_great_lance", skill: "Crushing", name: "Great lance", att: -10, agm: 0, dmg: 3, tgt: -1, grade: 2 }
];

export const rangedWeapons = [
  // PRECISION
  { id: "wpn_hand_cannon", skill: "Precision", name: "Hand cannon", att: 4, agm: -3, dmg: 0, tgt: 0, grade: 1 },
  { id: "wpn_revolver", skill: "Precision", name: "Revolver", att: 0, agm: 0, dmg: 0, tgt: 1, grade: 0 },
  { id: "wpn_long_rifle", skill: "Precision", name: "Long rifle", att: 6, agm: 0, dmg: 0, tgt: -1, grade: 0 },
  { id: "wpn_dmr", skill: "Precision", name: "DMR", att: 7, agm: -5, dmg: 0, tgt: 0, grade: 0 },
  { id: "wpn_stalker_rifle", skill: "Precision", name: "Stalker Rifle", att: 3, agm: 0, dmg: 0, tgt: 0, grade: 0 },
  { id: "wpn_strike_rifle", skill: "Precision", name: "Strike Rifle", att: -3, agm: -6, dmg: 0, tgt: 3, grade: 0 },
  { id: "wpn_bow", skill: "Precision", name: "Bow", att: -3, agm: 6, dmg: 0, tgt: 2, grade: -1 },

  // AUTOMATIC
  { id: "wpn_shotgun", skill: "Automatic", name: "Shotgun", att: -4, agm: 0, dmg: 0, tgt: "*2", grade: -1 },
  { id: "wpn_assault_rifle", skill: "Automatic", name: "Assault Rifle", att: 0, agm: 3, dmg: -1, tgt: "*2", grade: 0 },
  { id: "wpn_flamethrower", skill: "Automatic", name: "Flamethrower", att: 0, agm: 0, dmg: -1, tgt: "*2.5**", grade: 0 },
  { id: "wpn_machine_gun", skill: "Automatic", name: "Machine gun", att: 3, agm: 0, dmg: -1, tgt: "*2", grade: 1 },
  { id: "wpn_auto_cannon", skill: "Automatic", name: "Auto cannon", att: 0, agm: 0, dmg: -1, tgt: "*2", grade: 1 },
  { id: "wpn_vulcan_cannon", skill: "Automatic", name: "Vulcan Cannon", att: 0, agm: 0, dmg: 0, tgt: "*1.5**", grade: 1 },
  { id: "wpn_assault_cannon", skill: "Automatic", name: "Assault Cannon", att: -5, agm: -5, dmg: 0, tgt: "*2", grade: 1 },

  // HEAVY
  { id: "wpn_grenade_launcher", skill: "Heavy", name: "Grenade Launcher", att: -9, agm: 4, dmg: 1, tgt: 1, grade: 0 },
  { id: "wpn_rocket_launcher", skill: "Heavy", name: "Rocket Launcher", att: -6, agm: -6, dmg: 1, tgt: 1, grade: 0 },
  { id: "wpn_harquebus", skill: "Heavy", name: "Harquebus", att: 0, agm: 0, dmg: 2, tgt: -1, grade: 0 },
  { id: "wpn_siege_rifle", skill: "Heavy", name: "Siege Rifle", att: 3, agm: 0, dmg: 2, tgt: -2, grade: 0 },
  { id: "wpn_rail_gun", skill: "Heavy", name: "Rail Gun", att: 0, agm: 5, dmg: 2, tgt: -2, grade: 0 },
  { id: "wpn_hesperian_cannon", skill: "Heavy", name: "Hesperian Cannon", att: 5, agm: 0, dmg: 2, tgt: -2, grade: 0 }
];

export const meleeHeritages = [
  { 
    id: "mh_asmodeus", 
    heritage: "Of Asmodeus", 
    featureName: "Adrenaline Surge", 
    featureDesc: "Gain damage +1 while bleeding" 
  },
  { 
    id: "mh_meridian", 
    heritage: "Of the Meridian", 
    featureName: "Aerial", 
    featureDesc: "Gain damage +2 when weapon is thrown" 
  },
  { 
    id: "mh_hate", 
    heritage: "Of Hate", 
    featureName: "Angelic", 
    featureDesc: "Gain damage +1 when using an augmentation" 
  },
  { 
    id: "mh_agartha", 
    heritage: "Of Agartha", 
    featureName: "Brutal", 
    featureDesc: "Gain damage +1 (up to 3) for each adversary you’ve defeated in the previous verse" 
  },
  { 
    id: "mh_tiamat", 
    heritage: "Of Tiamat", 
    featureName: "Carnage", 
    featureDesc: "Target 3 adversaries with a successful attack check, without spending any Story Point" 
  },
  { 
    id: "mh_samael", 
    heritage: "Of Samael", 
    featureName: "Chaotic", 
    featureDesc: "Gain damage +2 if all adversaries in the conflict are in hordes" 
  },
  { 
    id: "mh_astaroth", 
    heritage: "Of Astaroth", 
    featureName: "Deadly", 
    featureDesc: "Increase the damage increment per Story Point by 1" 
  },
  { 
    id: "mh_hades", 
    heritage: "Of Hades", 
    featureName: "Death Blessing", 
    featureDesc: "Halve the aura loss in death dreams" 
  },
  { 
    id: "mh_cain", 
    heritage: "Of Cain", 
    featureName: "Death Driven", 
    featureDesc: "Recover 1 Life for each adversary you defeat" 
  },
  { 
    id: "mh_mephistopheles", 
    heritage: "Of Mephistopheles", 
    featureName: "Demon Satiator", 
    featureDesc: "Recover 1 Sanity for each adversary you defeat" 
  },
  { 
    id: "mh_heaven", 
    heritage: "Of Heaven", 
    featureName: "Heaven Forged", 
    featureDesc: "Ignore bones on champions and bosses of harrowed origin" 
  },
  { 
    id: "mh_beyond", 
    heritage: "Of the Beyond", 
    featureName: "Hell Forged", 
    featureDesc: "Ignore bones on champions and bosses of ancient origin" 
  },
  { 
    id: "mh_fenrir", 
    heritage: "Of Fenrir", 
    featureName: "Hungry for More", 
    featureDesc: "Gain AGM +1 (up to +10) for each adversary you’ve defeated in the last verse" 
  },
  { 
    id: "mh_horned_god", 
    heritage: "Of the Horned God", 
    featureName: "Impaling", 
    featureDesc: "Incapacitate your target for one verse if it is your only target in this attack" 
  },
  { 
    id: "mh_achilles", 
    heritage: "Of Achilles", 
    featureName: "Invulnerable", 
    featureDesc: "Ignore all damage from one defense roll (once per conflict)" 
  },
  { 
    id: "mh_sacrifice", 
    heritage: "Of Sacrifice", 
    featureName: "Pound of Flesh", 
    featureDesc: "Gain damage +2 if you have lost a body part this conflict" 
  },
  { 
    id: "mh_day_star", 
    heritage: "Of the Day Star", 
    featureName: "Prepared", 
    featureDesc: "Gain +1 damage for each verse you refrained from attacking in this conflict" 
  },
  { 
    id: "mh_hermes", 
    heritage: "Of Hermes", 
    featureName: "Quick", 
    featureDesc: "Double the number of targets hit per Story Point (quadruple if the weapon has Quick twice), disregard the TGT limit if it still permits at least 1 more target" 
  },
  { 
    id: "mh_sea", 
    heritage: "Of the Sea", 
    featureName: "Silenced", 
    featureDesc: "Muffle any sound you make" 
  },
  { 
    id: "mh_behemoth", 
    heritage: "Of Behemoth", 
    featureName: "Witch Marked", 
    featureDesc: "Spend 2 Sanity to reduce your attack dice roll by 1 (reaching 1 counts as a natural roll)" 
  }
];