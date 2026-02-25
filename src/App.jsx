import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';

// --- DATA INJECTION ---
import { GEAR_STATS, WEAPON_TABLE, LOOT_PREFIXES, GRENADE_TIERS, GRENADE_JUICE, LOOT_SUFFIXES, ARMOR_STATS } from './data/gear'; 
import { BEASTIARY } from './data/beastiary';
import { generateProceduralLoot } from './utils/lootGenerator';

// --- FIREBASE CORE ---
import { auth, googleProvider, db, requestNotificationPermission } from './firebase'; 
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, updateDoc, doc, setDoc } from "firebase/firestore";

// --- TAB INTERFACES ---
import RosterTab from './components/Tabs/RosterTab';
import CreatorTab from './components/Tabs/CreatorTab';
import SheetTab from './components/Tabs/SheetTab';
import SquadTab from './components/Tabs/SquadTab';
import OverseerTab from './components/Tabs/OverseerTab';
import Modals from './components/UI/Modals';
import Map from './components/Map' ;

// --- GLOBAL UTILS ---
const rollD20 = () => Math.floor(Math.random() * 20) + 1;
const XP_THRESHOLD = 100; 

// --- DATA SCHEMA: BOSS ENCOUNTER ---
// --- BOSS TELEMETRY SCHEMA ---
/**
 * BossPart: { id: string, name: string, hp: number, maxHp: number, isBroken: boolean, effect: string }
 * BossEncounter: { name: string, maxHp: number, currentHp: number, isStaggered: boolean, parts: BossPart[] }
 */
const INITIAL_BOSS_STATE = {
  name: "PENDING_CONTACT...",
  maxHp: 0,
  currentHp: 0,
  isStaggered: false,
  parts: []
};

function App() {
  // --- STATE: AUTH & BARRACKS ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ROSTER'); 
  const [roster, setRoster] = useState([]); 
  
  // --- STATE: TELEMETRY & MODALS ---
  const [rollResult, setRollResult] = useState(null);
  const [grenadeResult, setGrenadeResult] = useState(null); 
  const [viewData, setViewData] = useState(false); 
  const [viewPromotion, setViewPromotion] = useState(false); 
  const [isLogOpen, setIsLogOpen] = useState(false); 

  // --- STATE: MULTIPLAYER SQUAD ---
  const [squadRoster, setSquadRoster] = useState([]);
  const [squadInput, setSquadInput] = useState("");
  const [squadLogs, setSquadLogs] = useState([]); 
  const [partyLoot, setPartyLoot] = useState([]); 
  
  // --- STATE: OVERSEER PROTOCOLS ---
  const [gmSquadId, setGmSquadId] = useState(null);
  const [encounter, setEncounter] = useState(INITIAL_BOSS_STATE);
  const [bossNameInput, setBossNameInput] = useState("");
  const [bossHpInput, setBossHpInput] = useState("");

 // --- STATE: UNIT CREATOR ---
  const [step, setStep] = useState(1); 
  const initialCharacter = {
    name: "UNIT_UNNAMED", avatarUrl: "", rank: 1, xp: 0,           
    wallet: { blood: 0, honey: 0 }, 
    consumables: { grenades: 0, stims: 0, batteries: 0, souls: 0 }, // <--- ADDED BATTERIES and SOULS
    upgrades: {}, loadout: [], statuses: [], notes: "", squadId: null,   
    form: null, destiny: null, master: null, darkMark: null, innerDemon: null,
    currentVitals: { life: null, sanity: null, aura: null } 
  };
  const [character, setCharacter] = useState(initialCharacter);

  // --- AUTH SYNC ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        const q = query(collection(db, "characters"), where("uid", "==", currentUser.uid));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const loadedChars = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
          setRoster(loadedChars);
        });
        return () => unsubscribeSnapshot();
      } else {
        setRoster([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // --- NEURAL LINK & SQUAD TELEMETRY ---
  const activeNetworkId = (gmSquadId || character?.squadId || "").toUpperCase();

  useEffect(() => {
    if (!activeNetworkId) return;

    const qRoster = query(collection(db, "characters"), where("squadId", "==", activeNetworkId));
    const unsubscribeSquad = onSnapshot(qRoster, (snapshot) => {
      const mates = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setSquadRoster(mates);
    });

    const unsubscribeEncounter = onSnapshot(doc(db, "encounters", activeNetworkId), (docSnap) => {
        if (docSnap.exists()) setEncounter(docSnap.data());
        else setEncounter(null);
    });

    const qLogs = query(collection(db, "logs"), where("squadId", "==", activeNetworkId));
    const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
        const fetchedLogs = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        fetchedLogs.sort((a, b) => a.createdAt - b.createdAt);
        setSquadLogs(fetchedLogs.slice(-40)); 
    });

    const qLoot = query(collection(db, "party_loot"), where("squadId", "==", activeNetworkId));
    const unsubscribeLoot = onSnapshot(qLoot, (snapshot) => {
        const fetchedLoot = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        setPartyLoot(fetchedLoot);
    });

    return () => { unsubscribeSquad(); unsubscribeEncounter(); unsubscribeLogs(); unsubscribeLoot(); };
  }, [activeNetworkId]);

  // --- ACTIONS: BROADCAST & LINK ---
  const broadcastEvent = async (targetSquadId, message, type = 'info') => {
      if (!targetSquadId) return;
      try {
          await addDoc(collection(db, "logs"), {
              squadId: targetSquadId, message, type, createdAt: new Date().getTime() 
          });
      } catch (e) { console.error("Broadcast failed", e); }
  };

  const testNeuralLink = async () => {
    if (!user) { alert("ERROR: Identity required to link device."); return; }
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert("HARDWARE INCOMPATIBLE: This browser does not support the Neural Link (Push API). On iOS, you MUST 'Add to Home Screen' first.");
        return;
    }
    try {
        const token = await requestNotificationPermission();
        if (token) {
            await setDoc(doc(db, "users", user.uid), { fcmToken: token, lastSynced: new Date().getTime() }, { merge: true });
            alert("Neural Link Established: Your device is now receiving Overseer telemetry.");
        }
    } catch (error) { 
        console.error("Sync Failure:", error); 
        alert(`CRITICAL SYNC FAILURE: ${error.message}`);
    }
  };

  // --- PROCEDURAL FORGE & LOGISTICS ---
  
  // Fires when the Overseer hits the "Deploy Drop Pod" button
  const deployDropPod = async (squadId, quantity = 3) => {
    if (!squadId) return;
    try {
      // Loop to generate and push the requested number of items
      for (let i = 0; i < quantity; i++) {
          const item = generateProceduralLoot();
          
          // Push each generated item to your party_loot collection
          await addDoc(collection(db, "party_loot"), {
              ...item,
              squadId: squadId,
              createdAt: new Date().getTime()
          });
      }
      // Blast the announcement to the network log
      broadcastEvent(squadId, `NEURAL LINK: ${quantity} Relics deployed to Drop Pod.`, 'success');
      
    } catch (e) { 
      console.error("Firebase Error - Failed to deploy Drop Pod:", e); 
    }
  };

  const claimLoot = async (lootItem) => {
      if (!character.id) return;
      
      
      // The Blackjack engine parses the stats directly from this string
      const itemName = lootItem.name; 
      const newEquip = [...(character.destiny?.equipment || []), itemName];
      
      try {
          await updateDoc(doc(db, "characters", character.id), { "destiny.equipment": newEquip });
          setCharacter(prev => ({ ...prev, destiny: { ...prev.destiny, equipment: newEquip } }));
          
          // Wipe it from the network so nobody else can grab it
          await deleteDoc(doc(db, "party_loot", lootItem.id));
          
          broadcastEvent(character.squadId, `<<< ASSET SECURED: ${character.name} claimed ${itemName}`, 'success');
      } catch (e) { 
          console.error("Loot Claim Failed:", e); 
      }
  };

  const generateLoot = async () => {
    if (!character.id) { alert("COMMAND REJECTED: Unit must be synced to database."); return; }
    const generatedItem = generateProceduralLoot();
    const fullName = `[${generatedItem.condition}] ${generatedItem.tier} ${generatedItem.name}`;
    const newEquip = [...(character.destiny?.equipment || []), fullName];
    try {
        setCharacter(prev => ({ ...prev, destiny: { ...prev.destiny, equipment: newEquip } }));
        await updateDoc(doc(db, "characters", character.id), { "destiny.equipment": newEquip });
        if (character.squadId) broadcastEvent(character.squadId, `${character.name} extracted: ${fullName}`, 'success');
    } catch (e) { console.error(e); }
  };

  const triggerLootDrop = async (numberOfItems = 3) => {
    if (!gmSquadId || !encounter) return;
    let droppedItems = [];
    for(let i = 0; i < numberOfItems; i++) {
        const item = generateProceduralLoot(); 
        droppedItems.push(typeof item === 'string' ? item : `[${item.condition}] ${item.tier} ${item.name}`); 
    }
    try {
        await updateDoc(doc(db, "encounters", gmSquadId), { 
            groundLoot: [...(encounter.groundLoot || []), ...droppedItems] 
        });
        broadcastEvent(gmSquadId, `ASSETS DETECTED: ${numberOfItems} items dropped in local sector.`, 'success');
    } catch (e) { console.error("Loot Drop Failed", e); }
  };

  const claimGroundLoot = async (itemString, index) => {
      if (!character.id || !character.squadId || !encounter?.groundLoot) return;
      const updatedGroundLoot = [...encounter.groundLoot];
      updatedGroundLoot.splice(index, 1);
      const newEquip = [...(character.destiny?.equipment || []), itemString];
      try {
          await updateDoc(doc(db, "encounters", character.squadId), { groundLoot: updatedGroundLoot });
          await updateDoc(doc(db, "characters", character.id), { "destiny.equipment": newEquip });
          setCharacter(prev => ({ ...prev, destiny: { ...prev.destiny, equipment: newEquip } }));
          broadcastEvent(character.squadId, `ASSET SECURED: ${character.name} grabbed [${itemString}]!`, 'info');
      } catch (e) { console.error("Claim Failed", e); }
  };

  // --- CORE UNIT HELPERS ---
  const getMaxVital = (type, charData = character) => {
    if (!charData || !charData.form) return 10;
    const statMap = { life: 'PHY', sanity: 'DRV', aura: 'SPR' };
    const baseStat = charData.form.baseStats[statMap[type]] || 10;
    let total = 9 + Math.floor(baseStat / 5);
    if (charData.destiny?.bonuses?.[type]) total += charData.destiny.bonuses[type];
    if (charData.upgrades?.[type]) total += charData.upgrades[type];
    return total;
  };

  const getStat = (n) => {
    if (!character.form) return 10;
    let val = character.form.baseStats[n];
    if (character.upgrades?.[n]) val += character.upgrades[n];
    if (character.destiny?.bonuses?.[n]) val += character.destiny.bonuses[n];
    return val;
  };

  const toRoman = (num) => {
    const roman = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII' };
    return roman[Math.max(1, Math.min(7, num))] || num; 
  };

  const getLootColor = (itemName) => {
    if (itemName.includes("Void-Forged")) return "text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.8)] animate-pulse";
    if (itemName.includes("Satanic")) return "text-red-600 drop-shadow-[0_0_3px_rgba(220,38,38,0.5)]";
    if (itemName.includes("Genesis")) return "text-cyan-400 drop-shadow-[0_0_3px_rgba(34,211,238,0.5)]";
    if (itemName.includes("Ancient")) return "text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]";
    return "text-gray-300"; 
  };

const getGearStats = (itemString) => {
    // 1. Check if it's one of our new Relic Armors
    const armorKey = Object.keys(ARMOR_STATS).find(a => itemString.includes(a));
    if (armorKey) {
        return { isArmor: true, stats: ARMOR_STATS[armorKey], name: armorKey };
    }

    // 2. Otherwise, process it as a Weapon
    const tierKey = Object.keys(GEAR_STATS.weapons).find(t => itemString.includes(t));
    if (!tierKey) return null; 
    
    // (Your existing weapon logic stays intact here)
    const baseStats = GEAR_STATS.weapons[tierKey];
    const archetype = WEAPON_TABLE.find(w => itemString.includes(w.name));
    const suffix = LOOT_SUFFIXES ? LOOT_SUFFIXES.find(s => itemString.includes(s.name)) : null;
    
    const finalStats = { ...baseStats };
    if (archetype) {
        finalStats.att += archetype.stats.att + (suffix?.stats?.att || 0);
        finalStats.agm += archetype.stats.agm + (suffix?.stats?.agm || 0);
        finalStats.dmg += archetype.stats.dmg + (suffix?.stats?.dmg || 0);
        finalStats.tgt += archetype.stats.tgt + (suffix?.stats?.tgt || 0);
    }
    return { tier: tierKey, isArmor: false, stats: finalStats, name: itemString };
  };

  const getSkillTotal = (skillId, statName, categoryId) => {
    if (!character.form) return 0;
    const baseVal = getStat(statName); 
    let bonus = 0;
    
    // A. Apply Destiny / Form Bonuses
    if (character.destiny?.bonuses) {
        if (character.destiny.bonuses[skillId]) bonus += character.destiny.bonuses[skillId];
        if (character.destiny.bonuses[categoryId]) bonus += character.destiny.bonuses[categoryId];
    }

    // B. Apply Equipped Armor Bonuses
    const equippedArmorString = (character.loadout || []).find(item => {
        const stats = getGearStats(item);
        return stats && stats.isArmor;
    });

    if (equippedArmorString) {
        const armorData = getGearStats(equippedArmorString);
        // Ensure the armor has bonuses, and check if it buffs the current skill being rolled
        if (armorData && armorData.stats.bonuses && armorData.stats.bonuses[skillId]) {
            bonus += armorData.stats.bonuses[skillId];
        }
    }

    return baseVal + bonus;
  };

  const getCritRange = (charData, equippedWeaponString) => {
      let range = 1; 
      if (equippedWeaponString) {
          if (equippedWeaponString.includes("Ancient")) range += 2; 
          if (equippedWeaponString.includes("Void-Forged")) range += 4; 
      }
      if (charData.master && charData.master.includes("The Ancients")) { range += 1; }
      return range;
  };

  // --- ACTIONS: UNIT MANAGEMENT ---
  const handleLogin = async () => { try { await signInWithPopup(auth, googleProvider); } catch (e) { console.error(e); } };
  
  const handleLogout = async () => { 
    setGmSquadId(null); 
    setCharacter(initialCharacter); 
    setSquadRoster([]); 
    await signOut(auth); 
    setActiveTab('ROSTER'); 
  };
const saveCharacter = async () => {
    if (!user) { 
        alert("ERROR: You must be logged in to save."); 
        return; 
    }

    // --- AARON'S HOTFIX: STRICT DEPLOYMENT VALIDATION ---
    // 1. Check if they left the name blank
    if (!character.name || character.name === "UNIT_UNNAMED" || character.name.trim() === "") {
        alert("COMMAND REJECTED: Unit designation (Name) required.");
        setStep(1); 
        return;
    }

    // 2. The Nuclear Origin Check (Catches null, blank strings, empty arrays, and empty objects)
    const form = character.form;
    if (
        !form || 
        form === "" || 
        (Array.isArray(form) && form.length === 0) || 
        (typeof form === 'object' && Object.keys(form).length === 0)
    ) { 
        alert("COMMAND REJECTED: Origin/Form data missing. You must roll/select an Origin before deployment."); 
        setStep(2); 
        return; 
    }
    // ----------------------------------------------------

    try {
      const { id: _, ...cleanCharacter } = character; 
      const payload = { 
          ...cleanCharacter,
          currentVitals: { 
              life: getMaxVital('life', character), 
              sanity: getMaxVital('sanity', character), 
              aura: getMaxVital('aura', character) 
          }, 
          uid: user.uid, 
          createdAt: new Date() 
      };
      
      await addDoc(collection(db, "characters"), payload);
      alert(`UNIT ${character.name} DEPLOYED TO DATABASE`);
      setCharacter(initialCharacter); 
      setStep(1); 
      setActiveTab('ROSTER');
    } catch (e) { 
        console.error("Save Error:", e); 
        alert(`SAVE FAILED: ${e.message}`); 
    }
  };

  const deleteCharacter = async (charId, charName) => {
    if (window.confirm(`CONFIRM TERMINATION: Permanently delete unit ${charName}?`)) {
        try { await deleteDoc(doc(db, "characters", charId)); } catch (e) { console.error(e); }
    }
  };

  const loadCharacter = (charData) => {
    if (!charData.currentVitals) charData.currentVitals = { life: getMaxVital('life', charData), sanity: getMaxVital('sanity', charData), aura: getMaxVital('aura', charData) };
    if (!charData.rank) charData.rank = 1;
    if (!charData.xp) charData.xp = 0;
    if (!charData.upgrades) charData.upgrades = {};
    if (!charData.wallet) charData.wallet = { blood: 0, honey: 0 }; 
    if (!charData.loadout) charData.loadout = []; 
    if (!charData.statuses) charData.statuses = []; 
    
    // THE FIX: Ensure old characters get a battery slot
    if (!charData.consumables) charData.consumables = { grenades: 0, stims: 0, batteries: 0 }; 
    if (charData.consumables.batteries === undefined) charData.consumables.batteries = 0;
    
    if (charData.notes === undefined) charData.notes = ""; 
    
    setSquadRoster([]); 
    setCharacter(charData);
    setActiveTab('SHEET');
  };

  // --- ACTIONS: SHEET UPDATES ---
  const updateVital = async (type, change) => {
    const maxVal = getMaxVital(type);
    const currentVal = character.currentVitals?.[type] ?? maxVal;
    let newVal = currentVal + change;
    if (newVal < 0) newVal = 0;
    if (newVal > maxVal) newVal = maxVal;
    const updatedChar = { ...character, currentVitals: { ...(character.currentVitals || {}), [type]: newVal } };
    setCharacter(updatedChar);
    if (character.id) { try { await updateDoc(doc(db, "characters", character.id), { [`currentVitals.${type}`]: newVal }); } catch (e) { console.error(e); } }
  };

  const updateWallet = async (type, change) => {
      const newVal = Math.max(0, (character.wallet?.[type] || 0) + change);
      const updatedChar = { ...character, wallet: { ...character.wallet, [type]: newVal } };
      setCharacter(updatedChar);
      if (character.id) { try { await updateDoc(doc(db, "characters", character.id), { [`wallet.${type}`]: newVal }); } catch(e) { console.error(e); } }
  };

  const toggleStatus = async (statusId) => {
      let newStatuses = [...(character.statuses || [])];
      newStatuses = newStatuses.includes(statusId) ? newStatuses.filter(s => s !== statusId) : [...newStatuses, statusId];
      setCharacter(prev => ({ ...prev, statuses: newStatuses }));
      if (character.id) { try { await updateDoc(doc(db, "characters", character.id), { statuses: newStatuses }); } catch(e) { console.error(e); } }
  };

  const addXp = async (amount) => {
      if (!character.id) return;

      // Calculate the new XP, but FORCE it to stop at 0 if they subtract too much
      const currentXp = character.xp || 0;
      const newXp = Math.max(0, currentXp + amount);

      // Instantly update the UI so the player feels the click
      setCharacter(p => ({ ...p, xp: newXp }));

      // Push the fix to the Firebase network
      try {
          await updateDoc(doc(db, "characters", character.id), { xp: newXp });
      } catch(e) {
          console.error("XP Sync Failed:", e);
      }
  };

  const updateConsumable = async (type, change) => {
      if (!character.id) return;
      const newVal = Math.max(0, (character.consumables?.[type] || 0) + change);
      const updatedChar = { ...character, consumables: { ...character.consumables, [type]: newVal } };
      setCharacter(updatedChar);
      try { await updateDoc(doc(db, "characters", character.id), { [`consumables.${type}`]: newVal }); } catch(e) { console.error(e); }
  };

  const pullPin = async () => {
      if (!character.id) return;
      if (!character.consumables?.grenades || character.consumables.grenades <= 0) {
          alert("OUT OF ORDNANCE: No grenades available in backpack."); return;
      }
      updateConsumable('grenades', -1);
      const tierRoll = Math.floor(Math.random() * GRENADE_TIERS.length);
      const juiceRoll = Math.floor(Math.random() * GRENADE_JUICE.length);
      const t = GRENADE_TIERS[tierRoll];
      const j = GRENADE_JUICE[juiceRoll];
      setGrenadeResult({ tier: t, juice: j });
      
      if (character.squadId) {
          broadcastEvent(character.squadId, `${character.name} pulled a pin... [${t.name} - ${j.type} Payload]`, 'warning');
      }
  };

  const promoteUnit = async (upgradeType, upgradeKey) => {
      if (!character.id) return;
      const newRank = (character.rank || 1) + 1;
      const currentUpgrades = character.upgrades || {};
      const newBonus = (currentUpgrades[upgradeKey] || 0) + (upgradeType === 'stat' ? 1 : 2); 
      const newUpgrades = { ...currentUpgrades, [upgradeKey]: newBonus };
      const updatedChar = { ...character, rank: newRank, xp: 0, upgrades: newUpgrades };
      if (upgradeType === 'vital') { updatedChar.currentVitals = { ...updatedChar.currentVitals, [upgradeKey]: (updatedChar.currentVitals[upgradeKey] || 0) + 2 }; }
      setCharacter(updatedChar);
      setViewPromotion(false); 
      try {
          await updateDoc(doc(db, "characters", character.id), {
              rank: newRank, xp: 0, upgrades: newUpgrades,
              [`currentVitals.${upgradeKey}`]: upgradeType === 'vital' ? updatedChar.currentVitals[upgradeKey] : character.currentVitals[upgradeKey] || 0
          });
          alert(`PROMOTION SUCCESSFUL. UNIT RANK: ${newRank}`);
      } catch(e) { console.error("Promotion Failed", e); }
  };

  const performRoll = (skillName, baseTarget) => {
    let type = 'FAIL';
    const activeWeaponString = (character.loadout || []).find(item => { 
        const stats = getGearStats(item); 
        return stats && !stats.isArmor; 
    });
    
    let weaponBonus = 0;
    let weaponName = 'UNARMED';
    
    if (activeWeaponString) {
        const stats = getGearStats(activeWeaponString);
        if (stats) { weaponBonus = stats.stats.att || 0; weaponName = stats.name; }
        
        // --- AMMO & RESOURCE GATEWAY ---
        if (activeWeaponString.includes("Genesis")) {
            if ((character.consumables?.batteries || 0) <= 0) {
                alert("OUT OF BATTERY: Genesis weapon systems locked. Reload required.");
                return; // Halts the roll
            }
            updateConsumable('batteries', -1); // Drains 1 battery
        } 
        else if (activeWeaponString.includes("Satanic")) {
            if ((character.wallet?.blood || 0) <= 0) {
                alert("SOUL STARVED: Insufficient Blood to feed Satanic weapon.");
                return; // Halts the roll
            }
            updateWallet('blood', -1); // Drains 1 blood
        } 
        else if (activeWeaponString.includes("Ancient")) {
            if ((character.wallet?.honey || 0) <= 0) {
                alert("RESONANCE FADED: Insufficient Honey to channel Ancient weapon.");
                return; // Halts the roll
            }
            updateWallet('honey', -1); // Drains 1 honey
        }
    }

    // --- PROCEED WITH THE ROLL ---
    const roll = rollD20(); 
    const critWindow = getCritRange(character, activeWeaponString);
    const finalTarget = baseTarget + weaponBonus;

    if (roll <= critWindow) {
        type = 'CRIT';
        if (character.squadId) broadcastEvent(character.squadId, `HOT STREAK! ${character.name} rolled a ${roll} on ${skillName}!`, 'success');
    } else if (roll === 20) {
        type = 'JAM';
        if (character.squadId) broadcastEvent(character.squadId, `FATAL ERROR: ${character.name} jammed their weapon (${weaponName})!`, 'danger');
    } else if (roll <= finalTarget) {
        type = 'SUCCESS';
    }
    
    setRollResult({ roll, baseTarget, finalTarget, weaponBonus, critWindow, type, skill: skillName, weaponName: weaponName });
  };

  const toggleEquip = async (itemIndex, isCurrentlyEquipped) => {
    if (!character.id) return;
    let newLoadout = [...(character.loadout || [])];
    let newEquip = [...(character.destiny?.equipment || [])];

    if (isCurrentlyEquipped) {
        const item = newLoadout.splice(itemIndex, 1)[0];
        newEquip.push(item);
    } else {
        const item = newEquip[itemIndex];
        const stats = getGearStats(item);
        const isArmor = stats ? stats.isArmor : false;
        if (isArmor) {
            const armorCount = newLoadout.filter(i => getGearStats(i)?.isArmor).length;
            if (armorCount >= 1) { alert("LOADOUT FULL: Maximum 1 Armor module allowed."); return; }
        } else {
            const wpnCount = newLoadout.filter(i => !getGearStats(i)?.isArmor).length;
            if (wpnCount >= 4) { alert("LOADOUT FULL: Maximum 4 Weapons allowed."); return; }
        }
        newEquip.splice(itemIndex, 1);
        newLoadout.push(item);
    }

    try {
        const charRef = doc(db, "characters", character.id);
        setCharacter(prev => ({ ...prev, loadout: newLoadout, destiny: { ...prev.destiny, equipment: newEquip } }));
        await updateDoc(charRef, { "loadout": newLoadout, "destiny.equipment": newEquip });
    } catch (e) { console.error("Equip Toggle Failed:", e); }
  };

  const removeLoot = async (indexToRemove, isEquipped) => {
    if (!character.id) return;
    const targetArray = isEquipped ? (character.loadout || []) : (character.destiny?.equipment || []);
    const itemToRemove = targetArray[indexToRemove];
    if (!window.confirm(`CONFIRM DELETION: Drop ${itemToRemove}?`)) return;

    let newLoadout = [...(character.loadout || [])];
    let newEquip = [...(character.destiny?.equipment || [])];
    if (isEquipped) newLoadout.splice(indexToRemove, 1);
    else newEquip.splice(indexToRemove, 1);

    try {
        const charRef = doc(db, "characters", character.id);
        setCharacter(prev => ({ ...prev, loadout: newLoadout, destiny: { ...prev.destiny, equipment: newEquip } }));
        await updateDoc(charRef, { "loadout": newLoadout, "destiny.equipment": newEquip });
    } catch (e) { console.error("Loot Removal Failed:", e); }
  };

  const syncNotes = async () => {
      if (!character.id) return;
      try { await updateDoc(doc(db, "characters", character.id), { notes: character.notes }); } catch (e) { console.error("Notes Sync Failed", e); }
  };

  // --- ACTIONS: SQUAD & OVERSEER HANDLERS ---
  const joinSquad = async (code) => {
      if (!character.id || !code || code.trim() === "") return;
      const upperCode = code.toUpperCase().trim();
      setCharacter(prev => ({ ...prev, squadId: upperCode }));
      try { 
          await updateDoc(doc(db, "characters", character.id), { squadId: upperCode }); 
          broadcastEvent(upperCode, `>>> UNIT DEPLOYED: ${character.name} has linked to the network.`, 'info');
      } catch(e) { console.error("Squad Join Failed", e); }
  };

  const leaveSquad = async () => {
      if (!character.id) return;
      if (character.squadId) broadcastEvent(character.squadId, `<<< UNIT EXTRACTED: ${character.name} severed the link.`, 'info');
      setCharacter(prev => ({ ...prev, squadId: null }));
      setSquadRoster([]); 
      try { await updateDoc(doc(db, "characters", character.id), { squadId: null }); } catch(e) { console.error("Squad Leave Failed", e); }
  };

  const joinAsGm = (code) => {
      if (!code || code.trim() === "") return;
      const upperCode = code.toUpperCase().trim();
      setGmSquadId(upperCode);
      broadcastEvent(upperCode, `OVERSEER PROTOCOL: A Game Master has locked onto the network.`, 'boss');
  };

  const leaveGm = () => { 
      setGmSquadId(null); 
      setSquadRoster([]); 
      setEncounter(null); 
  };

  const spawnBoss = async () => {
      if (!gmSquadId || !bossNameInput || !bossHpInput) {
        alert("COMMAND REJECTED: Overseer must provide Name and HP telemetry.");
        return;
      }
      try {
          await setDoc(doc(db, "encounters", gmSquadId), { 
              name: bossNameInput.toUpperCase(), 
              hp: parseInt(bossHpInput), 
              maxHp: parseInt(bossHpInput) 
          });
          broadcastEvent(gmSquadId, `WARNING: Hostile Threat Detected - ${bossNameInput.toUpperCase()}`, 'boss');
          setBossNameInput(""); 
          setBossHpInput("");
      } catch (e) { console.error("Spawn Boss Failed", e); }
  };

  const updateBossHp = async (change) => {
      if (!gmSquadId || !encounter) return;
      const newHp = Math.max(0, encounter.hp + change);
      try { await updateDoc(doc(db, "encounters", gmSquadId), { hp: newHp }); } catch (e) { console.error("Update Boss Failed", e); }
  };

  const clearBoss = async () => {
      if (!gmSquadId) return;
      if (window.confirm("TERMINATE THREAT: Clear the current encounter?")) {
          try { 
              await deleteDoc(doc(db, "encounters", gmSquadId)); 
              broadcastEvent(gmSquadId, `TARGET ELIMINATED: Encounter cleared by Overseer.`, 'success');
          } catch (e) { console.error("Clear Boss Failed", e); }
      }
  };

  const adjustUnitVital = async (unitId, unitName, vitalType, change) => {
      if (!gmSquadId) return;
      const target = squadRoster.find(m => m.id === unitId);
      if (!target) return;

      const maxVal = getMaxVital(vitalType, target);
      const currentVal = target.currentVitals?.[vitalType] ?? maxVal;
      const newVal = Math.max(0, Math.min(maxVal, currentVal + change));

      try {
          await updateDoc(doc(db, "characters", unitId), { [`currentVitals.${vitalType}`]: newVal });
          
          // If it's damage (a negative change), broadcast the strike to the network
          if (change < 0) {
              const bossName = encounter?.name || "HOSTILE THREAT";
              broadcastEvent(gmSquadId, `⚠️ ${bossName} STRUCK ${unitName} FOR ${Math.abs(change)} ${vitalType.toUpperCase()} DAMAGE!`, 'danger');
          }
      } catch (e) { console.error("Overseer Strike Failed", e); }
  };

  const playerStrikeBoss = async (damage) => {
      if (!character.squadId || !encounter) return;
      
      const newHp = Math.max(0, encounter.hp - damage);
      
      try {
          // Update the boss HP in Firebase
          await updateDoc(doc(db, "squads", character.squadId), {
              "encounter.hp": newHp
          });
          
          // Blast the hit to the entire network
          broadcastEvent(character.squadId, `💥 ${character.name} STRUCK ${encounter.name} FOR ${damage} DMG!`, 'warning');
          
      } catch (e) {
          console.error("Failed to strike threat", e);
      }
  };

  const renderCombatLog = () => (
      <div className="border border-white/10 bg-black/60 p-2 mb-4 flex flex-col h-40 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] relative">
          <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-2 border-b border-white/10 pb-1 sticky top-0 bg-black/80 z-10 backdrop-blur-sm">Network Activity Log</div>
          {squadLogs.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[9px] text-gray-700 italic">Awaiting telemetry...</div>
          ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 flex flex-col-reverse">
                  {[...squadLogs].reverse().map(log => (
                      <div key={log.id} className="text-[9px] font-mono leading-snug break-words">
                          <span className="text-gray-600 opacity-50 mr-2">[{new Date(log.createdAt).toLocaleTimeString([], {hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                          <span className={`${log.type === 'success' ? 'text-green-400 font-bold' : log.type === 'danger' ? 'text-red-500 font-bold animate-pulse' : log.type === 'warning' ? 'text-orange-400' : log.type === 'boss' ? 'text-red-600 font-black uppercase tracking-widest' : 'text-gray-300'}`}>{log.message}</span>
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  // --- RENDER ---
  if (loading) return <div className="h-screen bg-black text-red-600 flex items-center justify-center font-mono">INITIALIZING...</div>;
  if (!user) return (
      <div className="h-screen w-full bg-black text-white font-mono flex flex-col items-center justify-center p-6 scanlines">
        <div className="border border-red-900/50 p-8 bg-red-950/10 max-w-sm w-full text-center">
          <h1 className="text-3xl font-black italic text-red-600 uppercase tracking-tighter mb-2">ASTRO INFERNO</h1>
          <button onClick={handleLogin} className="w-full bg-red-600 text-white py-4 font-bold uppercase tracking-widest hover:bg-white hover:text-red-600 transition-colors mt-8">Identify With Google</button>
        </div>
      </div>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white font-mono overflow-hidden relative">
      <Map />
      {/* HEADER */}
      <div className="h-14 border-b border-red-900/50 flex items-center px-4 justify-between bg-red-950/20 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <img 
            src={user.photoURL} 
            onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${user.displayName}&background=7f1d1d&color=f87171`; }}
            alt="User" 
            className="h-8 w-8 rounded-full border border-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]" 
          />
          <div>
            <h1 className="text-sm font-black italic text-red-600 uppercase tracking-tighter leading-none flex items-center gap-2">
              ASTRO INFERNO
              <span className="text-[8px] bg-red-900/40 text-red-400 border border-red-700/50 px-1.5 py-0.5 rounded tracking-widest not-italic">V4.0.0</span>
            </h1>
            <div className="text-[8px] text-gray-500 font-bold uppercase mt-0.5">CMD: {user.displayName.split(' ')[0]}</div>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={testNeuralLink} className="text-[10px] text-cyan-400 border border-cyan-900 px-2 py-1 uppercase hover:bg-cyan-900 hover:text-white transition-colors animate-pulse">Link Device</button>
            {activeTab === 'ROSTER' && (
                <button onClick={() => { setActiveTab('CREATOR'); setStep(1); setCharacter(initialCharacter); }} className="text-[10px] bg-red-600 text-white px-3 py-1 font-bold uppercase">+ New Unit</button>
            )}
            <button onClick={handleLogout} className="text-[10px] text-red-500 border border-red-900 px-2 py-1 uppercase hover:bg-red-900 hover:text-white">Log Out</button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar relative">
        {activeTab === 'ROSTER' && (
            <RosterTab 
                roster={roster} 
                loadCharacter={loadCharacter} 
                deleteCharacter={deleteCharacter} 
                getMaxVital={getMaxVital} 
            />
        )}
        
        {activeTab === 'CREATOR' && (
            <CreatorTab 
                step={step} 
                setStep={setStep} 
                character={character} 
                setCharacter={setCharacter} 
                saveCharacter={saveCharacter} 
                rollD20={rollD20} 
            />
        )}
        
        {activeTab === 'SHEET' && (
            <SheetTab 
                character={character} 
                setCharacter={setCharacter} 
                addXp={addXp} 
                setViewPromotion={setViewPromotion} 
                setViewData={setViewData} 
                updateWallet={updateWallet} 
                updateVital={updateVital} 
                getMaxVital={getMaxVital} 
                toggleStatus={toggleStatus} 
                getStat={getStat} 
                getSkillTotal={getSkillTotal} 
                performRoll={performRoll} 
                updateConsumable={updateConsumable} 
                pullPin={pullPin} 
                getGearStats={getGearStats} 
                getLootColor={getLootColor} 
                toRoman={toRoman} 
                toggleEquip={toggleEquip} 
                removeLoot={removeLoot} 
                generateLoot={generateLoot} 
                isLogOpen={isLogOpen} 
                setIsLogOpen={setIsLogOpen} 
                syncNotes={syncNotes} 
            />
        )}
        
        {activeTab === 'SQUAD' && (
            <SquadTab 
                character={character} 
                squadInput={squadInput} 
                setSquadInput={setSquadInput} 
                joinSquad={joinSquad} 
                leaveSquad={leaveSquad} 
                encounter={encounter} 
                squadRoster={squadRoster} 
                getMaxVital={getMaxVital} 
                renderCombatLog={renderCombatLog} 
                partyLoot={partyLoot} 
                claimLoot={claimLoot} 
                claimGroundLoot={claimGroundLoot}
                playerStrikeBoss={playerStrikeBoss}
            />
        )}
        
        {activeTab === 'OVERSEER' && (
            <OverseerTab 
                gmSquadId={gmSquadId} 
                squadInput={squadInput} 
                setSquadInput={setSquadInput} 
                joinAsGm={joinAsGm} 
                leaveGm={leaveGm} 
                renderCombatLog={renderCombatLog} 
                encounter={encounter} 
                bossNameInput={bossNameInput} 
                setBossNameInput={setBossNameInput} 
                bossHpInput={bossHpInput} 
                setBossHpInput={setBossHpInput} 
                spawnBoss={spawnBoss} 
                updateBossHp={updateBossHp} 
                clearBoss={clearBoss} 
                squadRoster={squadRoster} 
                getMaxVital={getMaxVital} 
                triggerLootDrop={triggerLootDrop}
                deployDropPod={deployDropPod}
                beastiary={BEASTIARY}
                adjustUnitVital={adjustUnitVital}
            />
        )}
      </div>

      {/* MOBILE NAV BAR */}
      <div className="h-16 border-t border-red-900/50 bg-black flex items-center justify-around px-1 shrink-0 z-50 relative">
        {['ROSTER', 'SHEET', 'SQUAD', 'OVERSEER'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex flex-col items-center justify-center w-1/4 h-full transition-all ${activeTab === tab ? `bg-${tab==='SQUAD'?'cyan':tab==='OVERSEER'?'purple':'red'}-950/30 border-t-2 border-${tab==='SQUAD'?'cyan-500':tab==='OVERSEER'?'purple-500':'red-600'} text-${tab==='SQUAD'?'cyan-400':tab==='OVERSEER'?'purple-400':'red-500'}` : 'text-gray-600 border-t-2 border-transparent'}`}>
              <span className="text-[9px] font-black uppercase tracking-widest">{tab === 'ROSTER' ? 'Barracks' : tab === 'SHEET' ? 'Unit' : tab}</span>
            </button>
        ))}
      </div>

      {/* RENDER MODALS */}
      <Modals 
          grenadeResult={grenadeResult} 
          setGrenadeResult={setGrenadeResult}
          rollResult={rollResult} 
          setRollResult={setRollResult}
          viewData={viewData} 
          setViewData={setViewData} 
          character={character}
          viewPromotion={viewPromotion} 
          setViewPromotion={setViewPromotion} 
          promoteUnit={promoteUnit}
      />
      
      {/* VERCEL WEB ANALYTICS */}
      <Analytics />
    </div>
  );
}
export default App;
