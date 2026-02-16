// DATABASE: FORMS & DESTINIES
// Extracted from Astro Inferno Roll Tables.xlsx

export const FORMS = [
  { 
    id: "f_undying", 
    name: "Undying", 
    description: "You survived the red plague and the horrors of the REGENESIS ten years ago, endured the Great Fog, and have found a new life in this world of death. You are a human in all regards, and have needs few other souls possess, such as air, food, and water. Still, your stubbornness, determination, and faith have saved your life countless times. Not living through the eternity of torment in the Damnation has also given you some perks, such as a clear, sane mind, at least compared to other souls. In this world, you are mostly viewed as an exotic entity, Or, in the worst case, as food.",
    startingCorruption: 0,
    baseStats: { PHY: 15, SPD: 10, COG: 15, DRV: 15, CHA: 15, SPR: 5 },
    qualities: {
      PHY: "Well Trained",
      SPD: "Years of Zero G",
      COG: "Scientist",
      DRV: "Survivor",
      CHA: "Well Spoken",
      SPR: "Fear of the Dark"
    },
    darkMarks: [
      { name: "The Faithful", description: "Your faith is intact and can help you both in life and death." },
      { name: "The Survivor", description: "You have survived the frontiers and learned to stay alive." },
      { name: "The Blacksmith", description: "You are a natural at crafting weapons and armor." }
    ],
    tables: {
      master: [
        { min: 1, max: 4, label: "Worm God" },
        { min: 5, max: 12, label: "Fallen Deity" },
        { min: 13, max: 16, label: "Cthonian Deity" },
        { min: 17, max: 20, label: "Egyptian Deity" }
      ]
    }
  },
  { 
    id: "f_darksoul", 
    name: "Dark Soul", 
    description: "Maybe you entered a dark pact, or your soul belongs to a dark entity. You are still human deep inside, but mysterious forces are attracted to your essence, and an aura of darkness surrounds your spirit. Most souls tend to avoid contact with Dark Souls, and see them as cursed and mysterious because of their dark auras and often wicked demeanor. Dark souls are inherently good mystics, alchemists, and witches, and Haxan actively seeks these souls, attempting to recruit them into their covens due to their affinity and connections to the dark powers beyond.",
    startingCorruption: 2,
    baseStats: { PHY: 5, SPD: 10, COG: 20, DRV: 10, CHA: 15, SPR: 25 },
    qualities: {
      PHY: "Weak and Powerless",
      SPD: "Quick to get away",
      COG: "Wise and Literate",
      DRV: "No aches or lusts",
      CHA: "Convincing",
      SPR: "Unnatural Aura"
    },
    darkMarks: [
      { name: "The Messenger", description: "You are a vessel of the Serpents, hearing their whispers brings good and bad fortune" },
      { name: "The High Priestess", description: "Your spirit is that of the priestess, you exude divinity and wisdom." },
      { name: "The Holy Diver", description: "You are Resilient to the Dark Lord's presence and corruption." }
    ],
    tables: {
      master: [
        { min: 1, max: 1, label: "Worm God" },
        { min: 2, max: 4, label: "Fallen Deity" },
        { min: 5, max: 19, label: "Ancient Deity" },
        { min: 20, max: 20, label: "Eternal" }
      ]
    }
  },
  { 
    id: "f_nanosuit", 
    name: "Nano Suit", 
    description: "Nanomachines course through the blood in your veins and have made you into something more than a mere human. They control you and you influence them. Once a human, you were resurrected by the extinction machines of the REGENESIS, their reasons hidden in shrouds. You have laid aside your human instincts for artificial senses, and may appear binary in your thoughts. Still, you corrupt like everyone else, and so do the nanomachines in your cells. You are fast in both body and mind, and possess a parallel thought process that gives you a dual stream of conciousness, making your decisions lightning fast - even if you're not always right, you can nearly always act and speak first. And like a constant signal in your ghost, inside your very blood, you can also hear the calling of the Dark Lord. Do you dream of electric goats?.",
    startingCorruption: 2,
    baseStats: { PHY: 15, SPD: 25, COG: 15, DRV: 10, CHA: 15, SPR: 5 },
    qualities: {
      PHY: "Exo Skeleton",
      SPD: "Nano Reflexes",
      COG: "Dual Brain",
      DRV: "Digital Mind",
      CHA: "Likable",
      SPR: "Ghost in the Shell"
    },
    darkMarks: [
      { name: "The Digital", description: "Your mind and reflexes work fast! Sometimes too fast for your own good." },
      { name: "The Assassin", description: "You are a silent killer ready to move and strike from the shadows." },
      { name: "The Navigator", description: "You are a traveler of the void and understand maps better than most souls." }
    ],
    tables: {
      master: [
        { min: 1, max: 2, label: "Fallen Entity" },
        { min: 3, max: 18, label: "Ancient Entity" },
        { min: 19, max: 19, label: "Machine Angel" },
        { min: 20, max: 20, label: "Eternal" }
      ]
    }
  },
  { 
    id: "f_satanic", 
    name: "Satanic Entity", 
    description: "You have corrupted into a full-fledged demonic appearance sometimes indistinguishable from true demons, all enhanced by nanotech and symbiotic harrowed tech, bound by the dark forces of the Abyss. Your presence exudes brute force and violence, causing most souls to turn the other way when they see you. Things tend to break when you are around even if your intentions are peaceful, since your muscles, reflexes, and limbs are, to a great part, demonic. Your Monstrosity has one huge benefit when it comes to interactions with True Unlight and the Satanic Court - they tend to appreciate your presence and violence. And even if you aren't the sharpest tool in the box, you have become very good at using this to your own benefit.",
    startingCorruption: 4,
    baseStats: { PHY: 25, SPD: 25, COG: 10, DRV: 20, CHA: 5, SPR: 10 },
    qualities: {
      PHY: "Violent & Aggressive",
      SPD: "Predator",
      COG: "One Track Mind",
      DRV: "Animal Instincts",
      CHA: "Rough Impressions",
      SPR: "Non Spiritual"
    },
    darkMarks: [
      { name: "The Behemoth", description: "You are a towering giant on the battlefield, feared by all foes" },
      { name: "The Immortal", description: "Your body has the power to heal itself at an astonishing rate." },
      { name: "The Berzerker", description: "You are a natural-born killer, set in this world for this one thing." }
    ],
    tables: {
      master: [
        { min: 1, max: 6, label: "Worm God" },
        { min: 7, max: 15, label: "Fallen Entity" },
        { min: 16, max: 18, label: "Ancient Entity" },
        { min: 19, max: 20, label: "Eternal" } 
      ]
    }
  },
  { 
    id: "f_genesis", 
    name: "Genesis Soul", 
    description: "You are a powerful machine. Something disconnected you from the mainframe of Michigan Red, and now you are treated as a free roaming entity by your former swarm. This world is alien and strange, but somehow familiar to you. Why do you have memories of Earth, of grass and forests, of horrid experiments of family? Fracture, in general, sees genesis machines as monsters, and, as such, you are discriminated against in most parts of society. You're excluded from the most rudimentary rights regular souls have, and the Satanic Court keeps an eye on you as soon as you approach, sometimes even metting you with open hostility. Your power and role as an outcast often makes you self-conscious, contemplating your faith and what it all means. What is humanity? What is good, what is evil? What - or how, or why - is life?",
    startingCorruption: 0, 
    baseStats: { PHY: 25, SPD: 10, COG: 25, DRV: 10, CHA: 10, SPR: 10 },
    qualities: {
      PHY: "Mechanical Strength",
      SPD: "Industrial Machine",
      COG: "Super Computer",
      DRV: "Zeroes and Ones",
      CHA: "Sleep Mode",
      SPR: "No Aura"
    },
    darkMarks: [
      { name: "The Silent Giant", description: "You are a large machine living as an outsider, trying to fit in." },
      { name: "The Sphinx", description: "You are used to dying, and can actually get stronger by it." },
      { name: "The Dragon", description: "You are a mythic spirit, and corruption tends to favor you more than others" }
    ],
    tables: {
      master: [
        { min: 1, max: 1, label: "Fallen Entity" },
        { min: 2, max: 16, label: "Ancient Entity" },
        { min: 17, max: 19, label: "Machine Entity" },
        { min: 20, max: 20, label: "Eternal" }
      ]
    }
  },
  { 
    id: "f_lilith", 
    name: "Lilith", 
    description: "Through darkness, your existence screamed in horror, born into this physical world. You are not human, but you must wear one of their bodies to survive. The flesh suit corrupts in here, and to stay young and healthy you need to change it once in a while. You mingle with souls, pretending to be one of them, hiding. The Satanic Court would never understand your - in their eyes - peculiar and frightening origin. And along your way, you seek another soul to procreate with, one not too far gone into corruption, in order to create life from your own blood. Give birth to a good quality flesh suit to keep as a life insurance, so that when corruptiom goes too far, you just step into your new flesh body and start over again. And again, watching the world corrupt around you as the eons pass.",
    startingCorruption: 4,
    baseStats: { PHY: 5, SPD: 10, COG: 25, DRV: 15, CHA: 20, SPR: 15 },
    qualities: {
      PHY: "Never Needed a Body",
      SPD: "Slippery",
      COG: "Gods to Some...",
      DRV: "From the Depths",
      CHA: "Seductive",
      SPR: "Sensitive Soul"
    },
    darkMarks: [
      { name: "The Blood Oracle", description: "You can sense the blood of any soul and discern its power." },
      { name: "The Abomination", description: "Your blood defends you and attacks your enemies in grotesque cascades." },
      { name: "The Keeper of Secrets", description: "You are connected to a vast net of contacts all over Fracture." }
    ],
    tables: {
      master: [
        { min: 1, max: 1, label: "Worm God" },
        { min: 2, max: 3, label: "Fallen Entity" },
        { min: 4, max: 15, label: "Ancient Entity" },
        { min: 16, max: 20, label: "Machine Angel" }
      ]
    }
  }
];

  // src/data/reference.js

export const DESTINIES = [
  {
    id: "d_jager",
    name: "Jäger",
    bonuses: { aura: 2, sanity: 2, maneuver: 5 },
    skillTrees: ["Affinity", "Infernal Survival", "Movement"],
    equipment: ["Excellent III Weapon", "Mundane I Armor", "Excellent III Dimension canvas"],
    feature: {
      name: "I KNOW A GUY…",
      description: "Your connections, general experiences, and experimental nature gives you the ability to use the Dark Connections skill as any Infernal Survival skill. Name the person when used."
    },
    innerDemon: { roll: "Roll 1D20-5", stat: "Power +1" }
  },
  {
    id: "d_mystic",
    name: "Mystic",
    bonuses: { aura: 3, sanity: 1, "divine rituals": 5 },
    skillTrees: ["Arcane Arts", "Crafts", "Literacy"],
    equipment: ["Ordinary II Weapon", "Excellent III Aether instrument", "Ordinary II Suspension cape"],
    feature: { name: "FLOW OF THE ABYSS", description: "..." },
    innerDemon: { roll: "Roll 1D20+3", stat: "Power +2" }
  },
  {
    id: "d_knight",
    name: "Knight",
    bonuses: { life: 4, "one warfare skill": 5 },
    skillTrees: ["Crafts", "Movement", "Warfare"],
    equipment: ["Excellent III Weapon", "Excellent III Armor", "Mundane I Wall cutter"],
    feature: { name: "HISTORY OF VIOLENCE", description: "..." },
    innerDemon: { roll: "Roll 1D20 +3", stat: "Power +2" }
  },
  {
    id: "d_necronaut",
    name: "Necronaut",
    bonuses: { sanity: 2, life: 2, stealth: 5 },
    skillTrees: ["Movement", "Perception", "Shadowry"],
    equipment: ["Excellent III Weapon", "Ordinary II Armor", "Ordinary II Quantum Device"],
    feature: { name: "ALWAYS CRAZY, NEVER IN SANE", description: "..." },
    innerDemon: { roll: "Roll 1D20-2", stat: "Power +2" }
  },
  {
    id: "d_deathweaver",
    name: "Death-Weaver",
    bonuses: { aura: 3, sanity: 1, "abyssal rituals": 5 },
    skillTrees: ["Arcane Arts", "Literacy", "Infernal Survival"],
    equipment: ["Masterful IV Slashing Weapon", "Ordinary II Mask of aether", "Mundane I Sphere"],
    feature: { name: "THE SHARPEST BLADE", description: "..." },
    innerDemon: { roll: "Roll 1D20", stat: "Power +3" }
  },
  {
    id: "d_muse",
    name: "Muse",
    bonuses: { life: 2, sanity: 2, conduct: 5 },
    skillTrees: ["Affinity", "Perception", "Shadowry"],
    equipment: ["Ordinary II Weapon", "Masterful IV Aether umbrella", "Ordinary II Blood pipe"],
    feature: { name: "CONDUCTING THE BLOOD", description: "..." },
    innerDemon: { roll: "Roll 1D20-7", stat: "Power +1" }
  },
  {
    id: "d_artisan",
    name: "Artisan",
    bonuses: { life: 3, sanity: 1, "one crafts skill": 5 },
    skillTrees: ["Crafts", "Infernal Survival", "Shadowry"],
    equipment: ["Excellent III Weapon", "Excellent III Carrier forge", "Mundane I Carrier workshop"],
    feature: { name: "ARTIFACT MAKER", description: "..." },
    innerDemon: { roll: "Roll 1D20+3", stat: "Power +2" }
  },
  {
    id: "d_rareblood",
    name: "Rare Blood",
    bonuses: { aura: 4, "dark connections": 5 },
    skillTrees: ["Affinity", "Literacy", "Warfare"],
    equipment: ["Excellent III Weapon", "500 Copper tokens", "Legendary V Vestige"],
    feature: { name: "GREATER RAREBLOOD", description: "..." },
    innerDemon: { roll: "Roll 1D20 1-12. Peacock 13-20. Fox", stat: "Power +1" }
  },
  {
    id: "d_psychotech",
    name: "Psycho Tech",
    bonuses: { aura: 2, sanity: 2, "perception skills": 5 },
    skillTrees: ["Affinity", "Perception", "Shadowry"],
    equipment: ["Ordinary II Weapon", "Masterful IV Nanotool", "Ordinary II Sphere"],
    feature: { name: "SPIRIT CONNECTION", description: "..." },
    innerDemon: { roll: "Roll 1D20 1-10. Peacock 11-15. Fox 16-20. Donkey", stat: "Power +1" }
  },
  {
    id: "d_doctor",
    name: "Doctor",
    bonuses: { sanity: 3, life: 1, medicine: 5 },
    skillTrees: ["Literacy", "Infernal Survival", "Shadowry"],
    equipment: ["Ordinary II Weapon", "Masterful IV Medicorder", "Ordinary II Dimension bag"],
    feature: { name: "THE GOOD SAMARITAN", description: "..." },
    innerDemon: { roll: "Roll 1D20", stat: "Power +2" }
  },
  {
    id: "d_witch",
    name: "Witch",
    bonuses: { sanity: 2, aura: 2, witchcraft: 5 },
    skillTrees: ["Arcane Arts", "Infernal Survival", "Craft"],
    equipment: ["Ordinary II Weapon", "Masterful IV Carrier Laboratory", "Excellent III Pet Machinae"],
    feature: { name: "UNHOLY HEX", description: "..." },
    innerDemon: { roll: "Roll 1D20+2", stat: "Power +2" }
  }
];