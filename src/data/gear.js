export const GEAR_STATS = {
  weapons: {
    "Mundane I":     { att: 0, agm: 0, dmg: 1, tgt: 1, grade: 0 },
    "Ordinary II":   { att: 0, agm: 0, dmg: 2, tgt: 2, grade: 0 },
    "Excellent III": { att: 0, agm: 0, dmg: 3, tgt: 3, grade: 0 },
    "Masterful IV":  { att: 1, agm: 1, dmg: 4, tgt: 4, grade: 1 },
    "Legendary V":   { att: 2, agm: 2, dmg: 5, tgt: 5, grade: 2 }
  },
  armor: {
    "Mundane I":     { arm: 1, grade: 0 },
    "Ordinary II":   { arm: 2, grade: 0 },
    "Excellent III": { arm: 3, grade: 0 },
    "Masterful IV":  { arm: 4, grade: 1 },
    "Legendary V":   { arm: 5, grade: 2 }
  }
};

export const WEAPON_TABLE = [
  { name: "Titan Spear of Tiamat", category: "Finesse", stats: { att: 6, agm: 3, dmg: 0, tgt: 0 } },
  { name: "Babylonian Revolver of the Great One", category: "Precision", stats: { att: 4, agm: -3, dmg: 0, tgt: 1 } },
  { name: "Divine Crowbar of Behemoth", category: "Finesse", stats: { att: 7, agm: 4, dmg: 0, tgt: -1 } },
  { name: "Myrkbeim Long Rifle of Execution", category: "Precision", stats: { att: 6, agm: 0, dmg: 0, tgt: 1 } },
  { name: "Elysian Whip of Agartha", category: "Finesse", stats: { att: 5, agm: 3, dmg: -1, tgt: 3 } },
  { name: "Eden DMR of the Maelstrom", category: "Precision", stats: { att: 12, agm: 0, dmg: 0, tgt: -1 } },
  { name: "Flesh Flail of the Beyond", category: "Finesse", stats: { att: 1, agm: -4, dmg: 1, tgt: 1 } },
  { name: "Blackened Stalker Rifle of the Void", category: "Precision", stats: { att: 3, agm: 0, dmg: 2, tgt: 0 } },
  { name: "Evolving Dagger of Samael", category: "Finesse", stats: { att: 0, agm: 5, dmg: 0, tgt: 0 } },
  { name: "Abyssal Bow of the Ravens", category: "Precision", stats: { att: -3, agm: 6, dmg: 1, tgt: 1 } },
  { name: "Inqusition Scythe of the Horned God", category: "Slashing", stats: { att: 0, agm: -5, dmg: 0, tgt: 0 } }, // tgt x2 special handling needed
  { name: "Legion Assualt Rifle of Aura", category: "Automatic", stats: { att: -3, agm: 0, dmg: 0, tgt: 0 } },
  { name: "Legion Blade of Hermes", category: "Slashing", stats: { att: -3, agm: 0, dmg: -1, tgt: 0 } },
  { name: "Ghost Machine Gun of the Horse", category: "Automatic", stats: { att: 5, agm: 2, dmg: -1, tgt: 0 } },
  { name: "Limbonian Katana of Asmodeus", category: "Slashing", stats: { att: 0, agm: 0, dmg: 0, tgt: 0 } },
  { name: "Sinful Flamethrower From Hell", category: "Automatic", stats: { att: 0, agm: 0, dmg: -1, tgt: 0 } },
  { name: "Cerberus Axe of Hades", category: "Slashing", stats: { att: 0, agm: 0, dmg: 1, tgt: 0 } },
  { name: "Inqusition Vulcan Cannon of Light", category: "Automatic", stats: { att: 0, agm: -5, dmg: 1, tgt: 0 } },
  { name: "Blood Yarn Sword of Cain", category: "Slashing", stats: { att: 2, agm: 6, dmg: -1, tgt: 0 } },
  { name: "Haxan Shotgun of Death", category: "Automatic", stats: { att: -4, agm: -5, dmg: 1, tgt: 0 } },
  { name: "Sinful Great Flail of Fenrir", category: "Crushing", stats: { att: -6, agm: -6, dmg: 1, tgt: 2 } },
  { name: "Cerberus Rocket Launcher of a Thousand", category: "Heavy", stats: { att: -6, agm: -6, dmg: 2, tgt: 2 } },
  { name: "Ghost Hammer of Achilles", category: "Crushing", stats: { att: 5, agm: 2, dmg: 2, tgt: -1 } },
  { name: "Eden Harquebus of Leviathan", category: "Heavy", stats: { att: 5, agm: 5, dmg: 2, tgt: -2 } },
  { name: "Haxan Great Sword of the Day Star", category: "Crushing", stats: { att: 0, agm: -5, dmg: 3, tgt: -1 } },
  { name: "Flesh Siege Rifle of Chaos", category: "Heavy", stats: { att: -1, agm: 0, dmg: 3, tgt: -2 } },
  { name: "Asgardian Great Spear of Mepbistopbeles", category: "Crushing", stats: { att: -7, agm: 4, dmg: 1, tgt: 1 } },
  { name: "Asgardian Rail Gun of the Rotten", category: "Heavy", stats: { att: 2, agm: 5, dmg: 2, tgt: -1 } },
  { name: "Conquistador Great Axe of Hate", category: "Crushing", stats: { att: 2, agm: 8, dmg: 2, tgt: -2 } },
  { name: "Abyssal Grenade Launcher of Blood", category: "Heavy", stats: { att: -9, agm: 4, dmg: 2, tgt: 0 } }
];

export const LOOT_PREFIXES = [
  { name: "Standard Issue", chance: 40, bonus: "None" }, //0-40%
  { name: "Genesis", chance: 25, bonus: "Precision +1" }, //41-65%
  { name: "Satanic", chance: 20, bonus: "Damage +1" }, //66-85%
  { name: "Ancient", chance: 10, bonus: "Range +1" }, //86-95%
  { name: "Void-Forged", chance: 5, bonus: "ALL STATS +1" } //96-100% (Jackpot)
];

// --- ORDNANCE: GRENADE TABLES ---
export const GRENADE_TIERS = [
    { name: "Mundane I", dmg: "1D2", dur: "1D2", area: "Intimate I", effect: "Stirring, slight inconvenience or reaction." },
    { name: "Ordinary II", dmg: "1D4", dur: "1D4", area: "Room II", effect: "Shocking, significant breakage or unrest." },
    { name: "Excellent III", dmg: "1D6", dur: "1D6", area: "Hall III", effect: "Intense, severe demolition or distress." },
    { name: "Masterful IV", dmg: "1D8", dur: "1D8", area: "Palace IV", effect: "Devastating, extreme destruction or torment." },
    { name: "Legendary V", dmg: "1D10", dur: "1D10", area: "City V", effect: "Cataclysmic, epic annihilation or disaster." }
];

export const GRENADE_JUICE = [
    { type: "Organ + Lingering + Wind", desc: "Creates a storm with spine-chilling howls that lasts for hours instead of verses." },
    { type: "Dreamy + Collateral + Fire", desc: "Burns down all living targets within their minds while keeping furniture intact." },
    { type: "Demonic + Penetrating + Flesh", desc: "Explodes into shards that pierce armor and eat any living tissue beneath." },
    { type: "Living + Deafening + Blood", desc: "Covers the area with bloody gore that attracts hordes of screeching bats." },
    { type: "Glass + Silencing + Death", desc: "Shatters anything that emits a sound louder than a footstep." }
];