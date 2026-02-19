// src/data/bestiary.js
// Extracted from Astro Inferno: Digital Core Edition (Pages 163-171)

export const BEASTIARY = [
  {
    category: "The Black Legion & Souls",
    threats: [
      { 
        id: "m_souls", 
        name: "Souls", 
        hp: 20, maxHp: 20, 
        description: "Often led by their inner demons, most souls flee if confronted or in the face of serious resistance. Armed with pickaxes, shovels, or other mundane weapons, they can be a handful if they outnumber their opponents." 
      },
      { 
        id: "m_legionaries", 
        name: "Legionaries", 
        hp: 40, maxHp: 40, 
        description: "The Black Legions are the regular armed forces of the Satanic Courts. Badly trained and equipped, these dirty, stupid masses barely maintain what semblance of order remains in Fracture." 
      },
      { 
        id: "m_centurions", 
        name: "Centurions", 
        hp: 120, maxHp: 120, 
        description: "The captains of the Black Legion, renowned for their brutality and reckless leadership. Clad in heavy armor blackened by the fires of Hell, intricately adorned with abyssal sigils, they command their troops with an iron fist." 
      }
    ]
  },
  {
    category: "Unlight Sparks & Nightmares",
    threats: [
      { 
        id: "m_pig_fiends", 
        name: "Pig Fiends", 
        hp: 35, maxHp: 35, 
        description: "The chilling calls from the pig fiends echoed through the tunnels, their screams and shrieks telling us it was just a matter of time before we were completely surrounded. Hunts in hordes." 
      },
      { 
        id: "m_harpies", 
        name: "Harpies", 
        hp: 45, maxHp: 45, 
        description: "The infernal harpies are hellish creatures with screeching voices. They fly in flocks of 10-50 and often nest in old ruins where they gather things they've stolen from travelers." 
      },
      { 
        id: "m_great_mother", 
        name: "Great Mother", 
        hp: 250, maxHp: 250, 
        description: "A myth said that she had too many children for this fragile reality... rumors began circulating about a creature deep below the city. Lairs filled with eggs & children." 
      }
    ]
  },
  {
    category: "Titans, Gods & True Unlight",
    threats: [
      { 
        id: "m_chimera", 
        name: "Chimera", 
        hp: 300, maxHp: 300, 
        description: "A nightmarish amalgamation of lion and goat with a serpent tail, the chimera's multiple heads snarl, hiss, and screech in a cacophonous concert of terror. Larger than a rhinoceros." 
      },
      { 
        id: "m_hydra_shark", 
        name: "Hydra Shark", 
        hp: 450, maxHp: 450, 
        description: "Nightmarish, biomechanical, Lovecraftian flying predators with multiple snapping shark heads. Hydra sharks prefer outer space and have a habit of breeding in deserted space stations." 
      },
      { 
        id: "m_seraph", 
        name: "Seraph", 
        hp: 800, maxHp: 800, 
        description: "Beings of godlike stature within the Satanic Court, they are fallen angels who have transcended malevolence. Their presence alone heralds doom and death. They emit unlight radiation." 
      },
      { 
        id: "m_archangel", 
        name: "Archangel", 
        hp: 1500, maxHp: 1500, 
        description: "Corrupted divinity who now serve only their inner demons. Within their Thrones they are omnipotent, with the power to bend reality to their liking. Immortal, and will be reborn if killed." 
      }
    ]
  }
];
