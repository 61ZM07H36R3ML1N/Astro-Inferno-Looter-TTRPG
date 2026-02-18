import { useState, useEffect } from 'react';
import { FORMS, DESTINIES } from './data/reference';
import { GEAR_STATS, WEAPON_TABLE, LOOT_PREFIXES, GRENADE_TIERS, GRENADE_JUICE, LOOT_SUFFIXES } from './data/gear'; 
import { SKILL_CATEGORIES } from './data/skills';

// FIREBASE IMPORTS
import { auth, googleProvider, db } from './firebase'; 
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, updateDoc, doc } from "firebase/firestore";

// --- UTILS (Outside Component) ---
const rollD20 = () => Math.floor(Math.random() * 20) + 1;
const XP_THRESHOLD = 100; 

const HAZARDS = [
    { id: 'BURNING', color: 'text-orange-500', bg: 'bg-orange-900/20', border: 'border-orange-500/50' },
    { id: 'BLEEDING', color: 'text-red-600', bg: 'bg-red-900/20', border: 'border-red-600/50' },
    { id: 'POISONED', color: 'text-green-500', bg: 'bg-green-900/20', border: 'border-green-500/50' },
    { id: 'STUNNED', color: 'text-yellow-500', bg: 'bg-yellow-900/20', border: 'border-yellow-500/50' },
    { id: 'PANICKED', color: 'text-purple-500', bg: 'bg-purple-900/20', border: 'border-purple-500/50' },
];

function App() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ROSTER'); 
  const [roster, setRoster] = useState([]); 
  
  // ROLLER & MODAL STATE
  const [rollResult, setRollResult] = useState(null);
  const [grenadeResult, setGrenadeResult] = useState(null); 
  const [viewData, setViewData] = useState(false); 
  const [viewPromotion, setViewPromotion] = useState(false); 
  const [isLogOpen, setIsLogOpen] = useState(false); // NEW: Collapsible Notes State

  // CREATOR STATE
  const [step, setStep] = useState(1); 
  const initialCharacter = {
    name: "UNIT_UNNAMED",
    avatarUrl: "",   
    rank: 1,         
    xp: 0,           
    wallet: { blood: 0, honey: 0 }, 
    consumables: { grenades: 0, stims: 0 }, 
    upgrades: {},    
    loadout: [],     
    statuses: [], 
    notes: "",       // NEW: Field Notes
    form: null,      
    destiny: null,   
    master: null,    
    darkMark: null,  
    innerDemon: null,
    currentVitals: { life: null, sanity: null, aura: null } 
  };
  const [character, setCharacter] = useState(initialCharacter);

  // --- AUTH & SYNC ---
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

  // --- HELPER: MAX VITALS ---
  const getMaxVital = (type, charData = character) => {
    if (!charData.form) return 10;
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

  // --- UI & MATH HELPERS ---
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
    const tierKey = Object.keys(GEAR_STATS.weapons).find(t => itemString.includes(t));
    if (!tierKey) return null; 
    
    const isArmor = itemString.toLowerCase().includes("armor");
    const baseStats = isArmor ? GEAR_STATS.armor[tierKey] : GEAR_STATS.weapons[tierKey];
    
    const archetype = !isArmor ? WEAPON_TABLE.find(w => itemString.includes(w.name)) : null;
    const suffix = (!isArmor && LOOT_SUFFIXES) ? LOOT_SUFFIXES.find(s => itemString.includes(s.name)) : null;

    const finalStats = { ...baseStats };
    if (archetype) {
        finalStats.att += archetype.stats.att + (suffix?.stats?.att || 0);
        finalStats.agm += archetype.stats.agm + (suffix?.stats?.agm || 0);
        finalStats.dmg += archetype.stats.dmg + (suffix?.stats?.dmg || 0);
        finalStats.tgt += archetype.stats.tgt + (suffix?.stats?.tgt || 0);
    }
    
    return { tier: tierKey, isArmor, stats: finalStats, name: itemString };
  };

  const getSkillTotal = (skillId, statName, categoryId) => {
    if (!character.form) return 0;
    const baseVal = getStat(statName); 
    let bonus = 0;
    if (character.destiny?.bonuses) {
        if (character.destiny.bonuses[skillId]) bonus += character.destiny.bonuses[skillId];
        if (character.destiny.bonuses[categoryId]) bonus += character.destiny.bonuses[categoryId];
    }
    return baseVal + bonus;
  };

  // --- ACTIONS ---
  const handleLogin = async () => { try { await signInWithPopup(auth, googleProvider); } catch (e) { console.error(e); } };
  const handleLogout = async () => { await signOut(auth); setActiveTab('ROSTER'); };

  const saveCharacter = async () => {
    if (!user) { alert("ERROR: You must be logged in to save."); return; }
    if (!character.form) { alert("ERROR: Form data missing. Please complete Phase 2."); return; }
    try {
      const maxLife = getMaxVital('life', character) || 10;
      const maxSanity = getMaxVital('sanity', character) || 10;
      const maxAura = getMaxVital('aura', character) || 10;
      const { id, ...cleanCharacter } = character; 
      const payload = { 
        ...cleanCharacter, 
        currentVitals: { life: maxLife, sanity: maxSanity, aura: maxAura },
        uid: user.uid, 
        createdAt: new Date() 
      };
      await addDoc(collection(db, "characters"), payload);
      alert(`UNIT ${character.name} DEPLOYED TO DATABASE`);
      setCharacter(initialCharacter);
      setStep(1);
      setActiveTab('ROSTER');
    } catch (e) { console.error("Save Error:", e); alert(`SAVE FAILED: ${e.message}`); }
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
    if (charData.avatarUrl === undefined) charData.avatarUrl = ""; 
    if (!charData.consumables) charData.consumables = { grenades: 0, stims: 0 }; 
    if (charData.notes === undefined) charData.notes = ""; // LEGACY PATCH
    setCharacter(charData);
    setActiveTab('SHEET');
  };

  const updateVital = async (type, change) => {
    const maxVal = getMaxVital(type);
    const currentVal = character.currentVitals?.[type] ?? maxVal;
    let newVal = currentVal + change;
    if (newVal < 0) newVal = 0;
    if (newVal > maxVal) newVal = maxVal;
    const updatedChar = { ...character, currentVitals: { ...(character.currentVitals || {}), [type]: newVal } };
    setCharacter(updatedChar);
    if (character.id) { try { await updateDoc(doc(db, "characters", character.id), { [`currentVitals.${type}`]: newVal }); } catch (e) { console.error("Sync Failed:", e); } }
  };

  const updateWallet = async (type, change) => {
      const currentVal = character.wallet?.[type] || 0;
      const newVal = Math.max(0, currentVal + change);
      const updatedChar = { ...character, wallet: { ...character.wallet, [type]: newVal } };
      setCharacter(updatedChar);
      if (character.id) { try { await updateDoc(doc(db, "characters", character.id), { [`wallet.${type}`]: newVal }); } catch(e) { console.error("Wallet Sync Failed", e); } }
  };

  const toggleStatus = async (statusId) => {
      if (!character.id) return;
      let newStatuses = [...(character.statuses || [])];
      if (newStatuses.includes(statusId)) {
          newStatuses = newStatuses.filter(s => s !== statusId); 
      } else {
          newStatuses.push(statusId); 
      }
      setCharacter(prev => ({ ...prev, statuses: newStatuses }));
      try { await updateDoc(doc(db, "characters", character.id), { statuses: newStatuses }); } catch(e) { console.error("Status Sync Failed", e); }
  };

  const addXp = async (amount) => {
      if (!character.id) return;
      const currentXp = character.xp || 0;
      const newXp = Math.min(XP_THRESHOLD, currentXp + amount); 
      const updatedChar = { ...character, xp: newXp };
      setCharacter(updatedChar);
      try { await updateDoc(doc(db, "characters", character.id), { xp: newXp }); } catch(e) { console.error("XP Sync Failed", e); }
  };

  const updateConsumable = async (type, change) => {
      if (!character.id) return;
      const currentVal = character.consumables?.[type] || 0;
      const newVal = Math.max(0, currentVal + change);
      const updatedChar = { ...character, consumables: { ...character.consumables, [type]: newVal } };
      setCharacter(updatedChar);
      try { await updateDoc(doc(db, "characters", character.id), { [`consumables.${type}`]: newVal }); } catch(e) { console.error("Consumable Sync Failed", e); }
  };

  const pullPin = async () => {
      if (!character.id) return;
      if (!character.consumables?.grenades || character.consumables.grenades <= 0) {
          alert("OUT OF ORDNANCE: No grenades available in backpack.");
          return;
      }
      updateConsumable('grenades', -1);
      const tierRoll = Math.floor(Math.random() * GRENADE_TIERS.length);
      const juiceRoll = Math.floor(Math.random() * GRENADE_JUICE.length);
      setGrenadeResult({ tier: GRENADE_TIERS[tierRoll], juice: GRENADE_JUICE[juiceRoll] });
  };

  const promoteUnit = async (upgradeType, upgradeKey) => {
      if (!character.id) return;
      const newRank = (character.rank || 1) + 1;
      const currentUpgrades = character.upgrades || {};
      const newBonus = (currentUpgrades[upgradeKey] || 0) + (upgradeType === 'stat' ? 1 : 2); 
      const newUpgrades = { ...currentUpgrades, [upgradeKey]: newBonus };
      const updatedChar = { ...character, rank: newRank, xp: 0, upgrades: newUpgrades };
      if (upgradeType === 'vital') {
          updatedChar.currentVitals = { ...updatedChar.currentVitals, [upgradeKey]: (updatedChar.currentVitals[upgradeKey] || 0) + 2 };
      }
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

  const getCritRange = (charData, equippedWeaponString) => {
      let range = 1; 
      if (equippedWeaponString) {
          if (equippedWeaponString.includes("Ancient")) range += 2; 
          if (equippedWeaponString.includes("Void-Forged")) range += 4; 
      }
      if (charData.master && charData.master.includes("The Ancients")) {
          range += 1;
      }
      return range;
  };

  const performRoll = (skillName, baseTarget) => {
    const roll = rollD20(); 
    let type = 'FAIL';

    const activeWeaponString = (character.loadout || []).find(item => {
        const stats = getGearStats(item);
        return stats && !stats.isArmor;
    });

    const critWindow = getCritRange(character, activeWeaponString);
    let weaponBonus = 0;
    let weaponName = 'UNARMED';
    
    if (activeWeaponString) {
        const stats = getGearStats(activeWeaponString);
        if (stats) {
            weaponBonus = stats.stats.att || 0;
            weaponName = stats.name;
        }
    }

    const finalTarget = baseTarget + weaponBonus;

    if (roll <= critWindow) type = 'CRIT'; 
    else if (roll === 20) type = 'JAM'; 
    else if (roll <= finalTarget) type = 'SUCCESS';

    setRollResult({ roll, baseTarget, finalTarget, weaponBonus, critWindow, type, skill: skillName, weaponName: weaponName });
  };

  const generateLoot = async () => {
    if (!character.id) { alert("COMMAND REJECTED: Unit must be synced to database."); return; }
    
    const roll = Math.floor(Math.random() * 100) + 1;
    let prefix = { name: "Standard Issue", chance: 40 };
    if (LOOT_PREFIXES) {
        let cumulative = 0;
        for (let p of LOOT_PREFIXES) { cumulative += p.chance; if (roll <= cumulative) { prefix = p; break; } }
    }
    
    const randomWeapon = WEAPON_TABLE[Math.floor(Math.random() * WEAPON_TABLE.length)];
    const tiers = Object.keys(GEAR_STATS.weapons); 
    const selectedTier = tiers[Math.floor(Math.random() * 5)];
    
    let suffixStr = "";
    if (LOOT_SUFFIXES && Math.random() > 0.5) {
        const randomSuffix = LOOT_SUFFIXES[Math.floor(Math.random() * LOOT_SUFFIXES.length)];
        suffixStr = ` ${randomSuffix.name}`;
    }

    const fullName = `${prefix.name === "Standard Issue" ? "" : prefix.name + " "}${selectedTier} ${randomWeapon.name}${suffixStr}`;
    
    const currentEquip = character.destiny?.equipment || [];
    const newEquip = [...currentEquip, fullName];
    
    try {
        const charRef = doc(db, "characters", character.id);
        setCharacter(prev => ({ ...prev, destiny: { ...prev.destiny, equipment: newEquip } }));
        await updateDoc(charRef, { "destiny.equipment": newEquip });
    } catch (e) { console.error("Loot Gen Failed:", e); }
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

  // --- NEW: CLOUD SYNC FIELD NOTES ---
  const syncNotes = async () => {
      if (!character.id) return;
      try {
          await updateDoc(doc(db, "characters", character.id), { notes: character.notes });
      } catch (e) {
          console.error("Notes Sync Failed", e);
      }
  };

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
      
      {/* HEADER */}
      <div className="h-14 border-b border-red-900/50 flex items-center px-4 justify-between bg-red-950/20 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <img src={user.photoURL} alt="User" className="h-8 w-8 rounded-full border border-red-600" />
          <div>
            <h1 className="text-sm font-black italic text-red-600 uppercase tracking-tighter leading-none">ASTRO INFERNO</h1>
            <div className="text-[8px] text-gray-500 font-bold uppercase">CMD: {user.displayName.split(' ')[0]}</div>
          </div>
        </div>
        <div className="flex gap-2">
            {activeTab === 'ROSTER' && (
                <button onClick={() => { setActiveTab('CREATOR'); setStep(1); setCharacter(initialCharacter); }} className="text-[10px] bg-red-600 text-white px-3 py-1 font-bold uppercase">
                    + New Unit
                </button>
            )}
            <button onClick={handleLogout} className="text-[10px] text-red-500 border border-red-900 px-2 py-1 uppercase hover:bg-red-900 hover:text-white">
                Log Out
            </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto pb-24 custom-scrollbar relative">
        
        {/* VISUAL HAZARD OVERLAYS */}
        {activeTab === 'SHEET' && (character.statuses || []).includes('BURNING') && <div className="pointer-events-none absolute inset-0 z-0 shadow-[inset_0_0_80px_rgba(234,88,12,0.4)] animate-pulse"></div>}
        {activeTab === 'SHEET' && (character.statuses || []).includes('POISONED') && <div className="pointer-events-none absolute inset-0 z-0 shadow-[inset_0_0_80px_rgba(34,197,94,0.2)]"></div>}
        {activeTab === 'SHEET' && (character.statuses || []).includes('BLEEDING') && <div className="pointer-events-none absolute inset-0 z-0 border-4 border-red-900/60"></div>}
        {activeTab === 'SHEET' && (character.statuses || []).includes('PANICKED') && <div className="pointer-events-none absolute inset-0 z-0 shadow-[inset_0_0_80px_rgba(168,85,247,0.3)] animate-pulse"></div>}
        {activeTab === 'SHEET' && (character.statuses || []).includes('STUNNED') && <div className="pointer-events-none absolute inset-0 z-0 bg-yellow-500/5 backdrop-blur-[1px] border border-dashed border-yellow-500/30"></div>}

        {/* TAB 1: ROSTER */}
        {activeTab === 'ROSTER' && (
           <div className="p-4 space-y-4 animate-in fade-in z-10 relative">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">Deployable Units</div>
              {roster.length === 0 ? (
                <div className="text-center py-10 opacity-50"><div className="text-4xl mb-2">∅</div><div>No Units Found</div></div>
              ) : (
                roster.map(char => (
                  <div key={char.id} className="w-full bg-white/5 border border-white/10 p-4 flex justify-between items-center group relative overflow-hidden">
                     <button onClick={() => loadCharacter(char)} className="flex-1 text-left z-10 flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-800 border border-white/20 overflow-hidden shrink-0">
                            {char.avatarUrl ? <img src={char.avatarUrl} alt="avatar" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-[8px] text-gray-600 font-bold uppercase">NO ID</div>}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="text-lg font-black italic uppercase group-hover:text-red-500 transition-colors">{char.name}</div>
                                <div className="bg-yellow-600/20 border border-yellow-600/50 text-yellow-500 text-[9px] px-1 font-bold">RK {char.rank || 1}</div>
                            </div>
                            <div className="text-[10px] text-gray-400 uppercase">{char.form?.name || 'UNKNOWN FORM'} • {char.destiny?.name || 'UNKNOWN DESTINY'}</div>
                        </div>
                     </button>
                     <div className="flex flex-col items-end gap-2 z-20 pl-4 border-l border-white/10 ml-4">
                        <div className="text-[8px] text-gray-500 uppercase">STATUS: <span className="text-green-500 font-bold">READY</span></div>
                        <button onClick={(e) => { e.stopPropagation(); deleteCharacter(char.id, char.name); }} className="text-[8px] text-red-600 border border-red-900/50 px-2 py-1 hover:bg-red-600 hover:text-white transition-colors uppercase">Discharge</button>
                     </div>
                  </div>
                ))
              )}
           </div>
        )}

        {/* TAB 2: CREATOR */}
        {activeTab === 'CREATOR' && (
          <div className="p-6 animate-in fade-in duration-300 z-10 relative">
             {step === 1 && (
               <div className="space-y-6">
                 <h2 className="text-3xl font-black uppercase">Initialize Unit</h2>
                 <div>
                     <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mb-1">Unit Designation</div>
                     <input type="text" value={character.name === "UNIT_UNNAMED" ? "" : character.name} placeholder="ENTER_NAME" className="w-full bg-white/5 border-b-2 border-cyan-600 p-4 text-xl font-bold uppercase focus:outline-none mb-4" onChange={(e) => setCharacter({...character, name: e.target.value.toUpperCase()})} />
                     <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mb-1">Visual ID (Image URL) [Optional]</div>
                     <input type="text" value={character.avatarUrl || ""} placeholder="https://..." className="w-full bg-white/5 border-b-2 border-cyan-600 p-3 text-sm focus:outline-none text-gray-300" onChange={(e) => setCharacter({...character, avatarUrl: e.target.value})} />
                 </div>
                 {character.avatarUrl && (
                     <div className="flex justify-center mt-4">
                         <div className="h-24 w-24 border border-cyan-500/50 bg-black/50 overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.3)]"><img src={character.avatarUrl} alt="Preview" className="h-full w-full object-cover" /></div>
                     </div>
                 )}
                 <button onClick={() => setStep(2)} className="w-full bg-cyan-600 hover:bg-cyan-500 py-4 font-bold uppercase text-black transition-colors mt-8">Next Phase</button>
               </div>
            )}
            {step === 2 && (
              <div className="space-y-3">
                <h2 className="text-xl font-black text-red-600 uppercase">Select Form</h2>
                {FORMS.map(form => (
                  <button key={form.id} onClick={() => setCharacter({...character, form: form})} className={`w-full text-left p-4 border transition-all ${character.form?.id === form.id ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500'}`}>
                    <div className="font-bold uppercase text-sm mb-2">{form.name}</div>
                    <div className="text-[11px] opacity-90 leading-relaxed whitespace-pre-wrap">{form.description}</div>
                  </button>
                ))}
                <button disabled={!character.form} onClick={() => setStep(3)} className="w-full bg-red-600 py-4 font-bold uppercase mt-4">Confirm</button>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-2">
                <h2 className="text-xl font-black text-red-600 uppercase mb-4">Select Destiny</h2>
                <div className="grid grid-cols-1 gap-2">
                  {DESTINIES.map(destiny => (
                    <button key={destiny.id} onClick={() => setCharacter({...character, destiny: destiny})} className={`text-left p-4 border flex flex-col justify-center ${character.destiny?.id === destiny.id ? 'bg-red-600 text-white border-red-600' : 'border-white/10 text-gray-500'}`}>
                      <span className="font-bold uppercase text-sm">{destiny.name}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {destiny.bonuses && Object.entries(destiny.bonuses).map(([key, val]) => ( <span key={key} className="text-[9px] bg-black/20 px-1 rounded uppercase">{key}+{val}</span> ))}
                      </div>
                    </button>
                  ))}
                </div>
                <button disabled={!character.destiny} onClick={() => setStep(4)} className="w-full bg-red-600 py-4 font-bold uppercase mt-4">Confirm</button>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-red-600 uppercase">Finalize Lore</h2>
                <button onClick={() => { const roll = rollD20(); const result = character.form.tables.master.find(m => roll >= m.min && roll <= m.max); setCharacter({...character, master: result?.label}); }} className="w-full border border-purple-500 p-4 uppercase font-bold text-purple-400"> {character.master ? character.master : "Roll Master Connection"} </button>
                <div className="space-y-2">
                    <div className="text-xs font-bold text-gray-500 uppercase">Select Dark Mark</div>
                    {character.form?.darkMarks.map((mark, i) => (
                        <button key={i} onClick={() => setCharacter({...character, darkMark: mark})} className={`w-full text-left p-3 border ${character.darkMark?.name === mark.name ? 'border-blue-500 bg-blue-900/20' : 'border-white/10'}`}>
                            <div className="text-[10px] font-bold text-blue-400 uppercase">{mark.name}</div>
                            <div className="text-[10px] text-gray-400">{mark.description}</div>
                        </button>
                    ))}
                </div>
                <button onClick={saveCharacter} className="w-full bg-green-600 py-4 font-bold uppercase mt-8 text-black">Sync to Database</button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SHEET */}
        {activeTab === 'SHEET' && (
          <div className="p-4 space-y-6 animate-in slide-in-from-bottom-5 z-10 relative">
            <div className="border-2 border-white/10 p-4 bg-black/80 backdrop-blur-sm relative overflow-hidden">
                
                {/* XP & RANK BAR */}
                <div className="mb-4">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                        <span>Rank {character.rank}</span>
                        <span>{character.xp} / {XP_THRESHOLD} XP</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 relative overflow-hidden mb-2">
                        <div style={{width: `${Math.min(100, (character.xp / XP_THRESHOLD) * 100)}%`}} className={`h-full transition-all duration-300 ${character.xp >= XP_THRESHOLD ? 'bg-yellow-400 animate-pulse' : 'bg-yellow-600'}`}></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                            <button onClick={() => addXp(1)} className="bg-white/5 border border-white/10 text-[9px] px-2 py-1 text-gray-400 hover:text-white">+1 XP</button>
                            <button onClick={() => addXp(5)} className="bg-white/5 border border-white/10 text-[9px] px-2 py-1 text-gray-400 hover:text-white">+5 XP</button>
                        </div>
                        {character.xp >= XP_THRESHOLD && (
                            <button onClick={() => setViewPromotion(true)} className="bg-yellow-500 text-black text-[9px] font-black px-3 py-1 uppercase animate-bounce">
                                ▲ PROMOTION AVAILABLE
                            </button>
                        )}
                    </div>
                </div>

                {/* HEADER WITH AVATAR & DATALINK */}
                <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gray-900 border border-white/20 overflow-hidden shrink-0 shadow-md">
                            {character.avatarUrl ? <img src={character.avatarUrl} alt="Avatar" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-[8px] text-gray-600 font-bold uppercase">NO ID</div>}
                        </div>
                        <div>
                            <div className="text-2xl font-black italic uppercase leading-none">{character.name}</div>
                            <div className="text-[10px] text-gray-500 font-mono mt-1">ID: 894-XJ • RK {character.rank}</div>
                        </div>
                    </div>
                    <button onClick={() => setViewData(true)} className="bg-cyan-950/30 hover:bg-cyan-900/50 border border-cyan-500/50 text-[9px] px-2 py-1 uppercase text-cyan-400 font-bold tracking-widest shrink-0">:: DATALINK</button>
                </div>

                {/* AETHER CACHE */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="border border-red-900/50 bg-red-950/20 p-2 relative overflow-hidden">
                         <div className="flex justify-between items-center mb-2"><div className="text-[9px] text-red-500 font-bold uppercase tracking-widest">BLOOD AETHER</div><div className="text-xl font-black text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]">{character.wallet?.blood || 0}</div></div>
                         <div className="flex gap-1"><button onClick={() => updateWallet('blood', -1)} className="flex-1 bg-red-900/20 hover:bg-red-600 hover:text-white border border-red-900/50 text-red-500 text-xs font-bold py-1">-</button><button onClick={() => updateWallet('blood', 1)} className="flex-1 bg-red-900/20 hover:bg-red-600 hover:text-white border border-red-900/50 text-red-500 text-xs font-bold py-1">+</button></div>
                    </div>
                    <div className="border border-yellow-600/50 bg-yellow-950/20 p-2 relative overflow-hidden">
                         <div className="flex justify-between items-center mb-2"><div className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest">HONEY AETHER</div><div className="text-xl font-black text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]">{character.wallet?.honey || 0}</div></div>
                         <div className="flex gap-1"><button onClick={() => updateWallet('honey', -1)} className="flex-1 bg-yellow-900/20 hover:bg-yellow-500 hover:text-black border border-yellow-600/50 text-yellow-500 text-xs font-bold py-1">-</button><button onClick={() => updateWallet('honey', 1)} className="flex-1 bg-yellow-900/20 hover:bg-yellow-500 hover:text-black border border-yellow-600/50 text-yellow-500 text-xs font-bold py-1">+</button></div>
                    </div>
                </div>

                {/* VITALS */}
                <div className="space-y-2 mb-4">
                    {['life', 'sanity', 'aura'].map(v => {
                        const max = getMaxVital(v);
                        const current = character.currentVitals?.[v] ?? max;
                        const percent = (current / max) * 100;
                        return (
                            <div key={v} className="bg-black border border-white/10 p-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] font-bold uppercase text-gray-500 tracking-widest">{v}</span>
                                    <span className={`text-sm font-black ${v === 'life' ? 'text-green-500' : v === 'sanity' ? 'text-blue-500' : 'text-purple-500'}`}>{current} <span className="text-gray-600 text-[10px]">/ {max}</span></span>
                                </div>
                                <div className="h-1 w-full bg-gray-800 mb-2 overflow-hidden"><div style={{width: `${percent}%`}} className={`h-full transition-all duration-300 ${v === 'life' ? 'bg-green-600' : v === 'sanity' ? 'bg-blue-600' : 'bg-purple-600'}`}></div></div>
                                <div className="flex gap-1">
                                    <button onClick={() => updateVital(v, -1)} className="flex-1 bg-white/5 hover:bg-red-900/50 text-red-500 font-bold text-xs py-2 border border-white/5">-</button>
                                    <button onClick={() => updateVital(v, 1)} className="flex-1 bg-white/5 hover:bg-green-900/50 text-green-500 font-bold text-xs py-2 border border-white/5">+</button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* HAZARD MONITOR */}
                <div className="mb-6 border border-white/10 p-2 bg-black/50">
                    <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-2 text-center">Hazard Monitor</div>
                    <div className="flex flex-wrap gap-1 justify-center">
                        {HAZARDS.map(hazard => {
                            const isActive = (character.statuses || []).includes(hazard.id);
                            return (
                                <button 
                                    key={hazard.id}
                                    onClick={() => toggleStatus(hazard.id)}
                                    className={`text-[8px] px-2 py-1 font-bold uppercase transition-all border ${
                                        isActive 
                                        ? `${hazard.bg} ${hazard.border} ${hazard.color} drop-shadow-[0_0_5px_currentColor]` 
                                        : 'bg-transparent border-white/10 text-gray-600 hover:text-gray-400'
                                    }`}
                                >
                                    {hazard.id}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-1 mb-6">
                   {['PHY', 'SPD', 'COG', 'DRV', 'CHA', 'SPR'].map(s => ( <div key={s} className="bg-black border border-white/10 p-2 text-center"> <div className="text-[8px] text-gray-400">{s}</div> <div className="text-sm font-bold">{getStat(s)}</div> </div> ))}
                </div>
                
                {/* SKILLS */}
                <div className="space-y-4">
                    <div className="text-[10px] uppercase text-gray-500 tracking-widest border-b border-white/10 pb-1">Neural Network</div>
                    {SKILL_CATEGORIES.map(cat => (
                        <div key={cat.id} className="space-y-1">
                            <div className="text-[8px] text-red-800 font-bold uppercase">{cat.name}</div>
                            <div className="grid grid-cols-2 gap-1">
                                {cat.skills.map(skill => {
                                    const total = getSkillTotal(skill.id, skill.stat, cat.id);
                                    return (
                                        <button 
                                          key={skill.id} 
                                          onClick={() => performRoll(skill.name, total)}
                                          className="flex justify-between bg-white/5 p-1 px-2 border border-white/5 hover:bg-white/20 hover:border-red-500 transition-all active:scale-95"
                                        >
                                            <span className="text-[9px] uppercase">{skill.name}</span>
                                            <span className="text-[9px] font-bold text-gray-400">{total}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* TACTICAL BACKPACK */}
                <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-3 border-b border-white/10 pb-1">Tactical Backpack</div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-blue-950/20 border border-blue-900/30 p-2 flex flex-col items-center justify-between">
                            <div className="text-[9px] text-blue-400 font-bold uppercase tracking-widest mb-2">Med-Stims</div>
                            <div className="flex items-center gap-3 mb-2">
                                <button onClick={() => updateConsumable('stims', -1)} className="bg-blue-900/30 text-blue-500 px-2 py-1 hover:bg-blue-600 hover:text-white">-</button>
                                <span className="text-xl font-black text-blue-400">{character.consumables?.stims || 0}</span>
                                <button onClick={() => updateConsumable('stims', 1)} className="bg-blue-900/30 text-blue-500 px-2 py-1 hover:bg-blue-600 hover:text-white">+</button>
                            </div>
                            <button onClick={() => { if(character.consumables?.stims > 0) { updateConsumable('stims', -1); updateVital('life', 5); } }} className="w-full bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/50 text-[8px] py-1 font-bold uppercase transition-colors">Inject (Heal 5)</button>
                        </div>

                        <div className="bg-orange-950/20 border border-orange-900/30 p-2 flex flex-col items-center justify-between">
                            <div className="text-[9px] text-orange-400 font-bold uppercase tracking-widest mb-2">Ordnance</div>
                            <div className="flex items-center gap-3 mb-2">
                                <button onClick={() => updateConsumable('grenades', -1)} className="bg-orange-900/30 text-orange-500 px-2 py-1 hover:bg-orange-600 hover:text-white">-</button>
                                <span className="text-xl font-black text-orange-400">{character.consumables?.grenades || 0}</span>
                                <button onClick={() => updateConsumable('grenades', 1)} className="bg-orange-900/30 text-orange-500 px-2 py-1 hover:bg-orange-600 hover:text-white">+</button>
                            </div>
                            <button onClick={pullPin} className={`w-full text-[8px] py-1 font-bold uppercase transition-colors border ${character.consumables?.grenades > 0 ? 'bg-orange-600 hover:bg-red-600 text-white border-orange-500 animate-pulse' : 'bg-gray-900 text-gray-600 border-gray-800'}`}>PULL PIN</button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-2 border-b border-green-900/50 pb-1">
                             <div className="text-[10px] uppercase text-green-500 font-bold tracking-widest">Active Loadout</div>
                             <div className="text-[8px] text-gray-500 uppercase">Max 4 WPN / 1 ARM</div>
                        </div>
                        <div className="space-y-2">
                            {(!character.loadout || character.loadout.length === 0) && ( <div className="text-[9px] text-gray-600 text-center py-2 border border-dashed border-white/5">LOADOUT EMPTY</div> )}
                            {(character.loadout || []).map((item, i) => {
                                const gear = getGearStats(item);
                                const rarityColor = getLootColor(item);
                                return (
                                    <div key={i} className="flex justify-between items-center bg-green-950/10 border border-green-900/30 p-2 group">
                                        <div className="flex-1">
                                            <div className={`text-[9px] font-bold uppercase ${rarityColor}`}>{gear ? gear.name : item}</div>
                                            {gear && (
                                                <div className="flex gap-2">
                                                    {!gear.isArmor && <span className="text-gray-400 text-[9px] font-bold">DMG {toRoman(gear.stats.dmg)}</span>}
                                                    {gear.isArmor && <span className="text-blue-400 text-[9px] font-bold">ARM {gear.stats.arm}</span>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => toggleEquip(i, true)} className="text-[8px] bg-orange-900/50 text-orange-400 px-2 py-1 font-bold uppercase hover:bg-orange-600 hover:text-white">Unequip</button>
                                            <button onClick={() => removeLoot(i, true)} className="text-gray-600 hover:text-red-500 font-bold px-2 py-1 text-xs">X</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2 border-b border-white/10 pb-1">
                             <div className="text-[10px] uppercase text-gray-500 tracking-widest">The Stash</div>
                             <button onClick={generateLoot} className="text-[9px] bg-red-600 text-white px-2 py-1 font-bold uppercase hover:bg-white hover:text-red-600 transition-colors animate-pulse">+ Generate Loot</button>
                        </div>
                        <div className="space-y-2">
                            {(!character.destiny?.equipment || character.destiny.equipment.length === 0) && ( <div className="text-[9px] text-gray-600 text-center py-2 border border-dashed border-white/5">STASH EMPTY</div> )}
                            {(character.destiny?.equipment || []).map((item, i) => {
                                const gear = getGearStats(item);
                                const rarityColor = getLootColor(item);
                                return (
                                    <div key={i} className="flex justify-between items-center bg-white/5 border border-white/10 p-2 group hover:bg-white/10 transition-colors">
                                        <div className="flex-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <div className={`text-[9px] font-bold uppercase ${rarityColor}`}>{gear ? gear.name : item}</div>
                                            {gear && (
                                                <div className="flex gap-2">
                                                    {!gear.isArmor && <span className="text-gray-500 text-[9px] font-bold">DMG {toRoman(gear.stats.dmg)}</span>}
                                                    {gear.isArmor && <span className="text-blue-500 text-[9px] font-bold">ARM {gear.stats.arm}</span>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => toggleEquip(i, false)} className="text-[8px] bg-green-900/50 text-green-400 px-2 py-1 font-bold uppercase hover:bg-green-600 hover:text-white">Equip</button>
                                            <button onClick={() => removeLoot(i, false)} className="text-gray-600 hover:text-red-500 font-bold px-2 py-1 text-xs">X</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- NEW: DATA LOG (FIELD NOTES) --- */}
                <div className="mt-6 pt-4 border-t border-white/10">
                    <button 
                        onClick={() => setIsLogOpen(!isLogOpen)}
                        className="w-full flex justify-between items-center mb-2 border-b border-white/10 pb-1 group"
                    >
                         <div className="text-[10px] uppercase text-gray-500 tracking-widest group-hover:text-white transition-colors">Data Log (Field Notes)</div>
                         <div className="text-[10px] text-gray-500">{isLogOpen ? '▼' : '▶'}</div>
                    </button>
                    
                    {isLogOpen && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                            <textarea
                                value={character.notes || ""}
                                onChange={(e) => setCharacter({...character, notes: e.target.value})}
                                onBlur={syncNotes}
                                placeholder="ENTER_MISSION_LOGS_HERE..."
                                className="w-full bg-black/50 border border-white/10 p-3 text-xs text-gray-300 font-mono h-40 focus:outline-none focus:border-cyan-500/50 transition-colors custom-scrollbar placeholder:text-gray-700"
                            />
                            <div className="text-right text-[8px] text-gray-600 uppercase mt-1">Data encrypts and syncs when clicking outside the box.</div>
                        </div>
                    )}
                </div>

            </div>
            <button onClick={() => setActiveTab('ROSTER')} className="w-full border border-white/10 text-gray-500 py-3 uppercase text-xs hover:border-white hover:text-white transition-colors relative z-10 mt-6">Return to Barracks</button>
          </div>
        )}
      </div>

      {/* MOBILE NAV BAR */}
      <div className="h-20 border-t border-red-900/50 bg-black flex items-center justify-around px-2 shrink-0 z-50 relative">
        <button onClick={() => setActiveTab('ROSTER')} className={`flex flex-col items-center gap-1 w-1/3 ${activeTab === 'ROSTER' ? 'text-red-600' : 'text-gray-600'}`}>
          <span className="text-[10px] font-black uppercase tracking-tighter">Barracks</span>
          <div className={`h-1 w-8 transition-all ${activeTab === 'ROSTER' ? 'bg-red-600 shadow-[0_0_8px_red]' : 'bg-transparent'}`}></div>
        </button>
        <button onClick={() => setActiveTab('SHEET')} className={`flex flex-col items-center gap-1 w-1/3 ${activeTab === 'SHEET' ? 'text-red-600' : 'text-gray-600'}`}>
          <span className="text-[10px] font-black uppercase tracking-tighter">Active Unit</span>
          <div className={`h-1 w-8 transition-all ${activeTab === 'SHEET' ? 'bg-red-600 shadow-[0_0_8px_red]' : 'bg-transparent'}`}></div>
        </button>
      </div>

      {/* DETONATION PROTOCOL MODAL */}
      {grenadeResult && (
        <div className="fixed inset-0 z-[100] bg-red-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-100" onClick={() => setGrenadeResult(null)}>
           <div className="w-full max-w-sm border-4 border-red-600 bg-black p-8 text-center shadow-[0_0_80px_rgba(220,38,38,0.6)]" onClick={e => e.stopPropagation()}>
              <div className="text-[12px] font-bold uppercase tracking-[0.4em] mb-6 text-red-500 animate-pulse">Detonation Protocol</div>
              
              <div className="mb-6 border-b border-red-900/50 pb-4">
                  <div className="text-3xl font-black text-white uppercase italic">{grenadeResult.tier.name}</div>
                  <div className="text-orange-400 text-[10px] uppercase font-bold tracking-widest mt-1">Area: {grenadeResult.tier.area}</div>
              </div>

              <div className="flex justify-center gap-4 mb-6">
                  <div className="bg-red-900/20 border border-red-900 p-2 w-1/2">
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest">Damage</div>
                      <div className="text-2xl font-black text-red-500">{grenadeResult.tier.dmg}</div>
                  </div>
                  <div className="bg-orange-900/20 border border-orange-900 p-2 w-1/2">
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest">Duration</div>
                      <div className="text-2xl font-black text-orange-500">{grenadeResult.tier.dur}</div>
                  </div>
              </div>

              <div className="bg-white/5 p-4 border border-white/10 text-left">
                  <div className="text-yellow-500 font-bold uppercase text-[10px] mb-1 tracking-widest">Payload: {grenadeResult.juice.type}</div>
                  <div className="text-sm text-white italic leading-relaxed">"{grenadeResult.juice.desc}"</div>
                  <div className="text-[9px] text-gray-400 mt-2 border-t border-white/10 pt-2">{grenadeResult.tier.effect}</div>
              </div>

              <button onClick={() => setGrenadeResult(null)} className="mt-8 w-full border border-red-600 text-red-500 py-3 uppercase text-xs font-bold hover:bg-red-600 hover:text-white transition-colors">Clear Blast Zone</button>
           </div>
        </div>
      )}

      {/* ROLL RESULT MODAL */}
      {rollResult && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-100" onClick={() => setRollResult(null)}>
           <div className={`w-full max-w-sm border-2 p-8 text-center shadow-[0_0_30px_rgba(0,0,0,0.5)] transform scale-100 transition-all ${
               rollResult.type === 'CRIT' ? 'border-yellow-500 bg-yellow-900/20' : rollResult.type === 'SUCCESS' ? 'border-green-500 bg-green-900/20' : rollResult.type === 'JAM' ? 'border-red-600 bg-red-900/20 border-dashed' : 'border-red-800 bg-red-950/40'}`}>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-white opacity-70">Resolution Protocol</div>
              <div className="text-6xl font-black mb-2 text-white drop-shadow-md">{rollResult.roll}</div>
              <div className={`text-2xl font-black uppercase italic tracking-tighter mb-4 ${ rollResult.type === 'CRIT' ? 'text-yellow-400' : rollResult.type === 'SUCCESS' ? 'text-green-500' : rollResult.type === 'JAM' ? 'text-red-600 animate-pulse' : 'text-red-800'}`}>
                  {rollResult.type === 'CRIT' ? 'HOT STREAK' : rollResult.type === 'JAM' ? 'FATAL ERROR' : rollResult.type}
              </div>
              <div className="border-t border-white/20 pt-4 space-y-1 text-left text-[9px] font-mono text-gray-400 uppercase tracking-widest bg-black/50 p-3">
                  <div className="flex justify-between"><span className="text-gray-500">Skill</span><span className="text-white font-bold">{rollResult.skill}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Active Weapon</span><span className="text-blue-400 font-bold">{rollResult.weaponName}</span></div>
                  <div className="flex justify-between mt-2 border-t border-white/10 pt-1"><span className="text-gray-500">Base Target</span><span className="text-white">≤{rollResult.baseTarget}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Weapon Bonus</span><span className="text-green-400">+{rollResult.weaponBonus}</span></div>
                  <div className="flex justify-between border-t border-white/10 pt-1 text-xs"><span className="text-gray-300">Final Target</span><span className="text-white font-black">≤{rollResult.finalTarget}</span></div>
                  <div className="flex justify-between text-[8px] text-yellow-500/80 mt-2"><span>Crit Range</span><span>1-{rollResult.critWindow}</span></div>
              </div>
              <div className="mt-8 text-[9px] uppercase tracking-widest text-gray-500 animate-pulse">Tap anywhere to dismiss</div>
           </div>
        </div>
      )}

      {/* DATALINK MODAL */}
      {viewData && character.form && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setViewData(false)}>
            <div className="w-full max-w-sm border border-cyan-900/50 bg-cyan-950/10 p-6 relative shadow-[0_0_50px_rgba(8,145,178,0.2)]" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-6 border-b border-cyan-500/20 pb-4"><h2 className="text-xl font-black italic text-cyan-400 uppercase tracking-tighter">DATA_UPLINK</h2><div className="text-[9px] text-cyan-600 font-mono">SECURE CONNECTION ESTABLISHED</div></div>
                <div className="space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar pr-2">
                    {character.avatarUrl && (<div className="border border-cyan-900/50 p-1 bg-black"><img src={character.avatarUrl} alt="Dossier" className="w-full h-40 object-cover grayscale opacity-80" /></div>)}
                    <div><div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Identity Config</div><div className="text-lg font-bold text-white uppercase">{character.form?.name || 'UNKNOWN FORM'}</div><div className="text-[10px] text-gray-400 leading-relaxed mb-2">{character.form?.description || 'No data found.'}</div><div className="text-sm font-bold text-white uppercase mt-2">{character.destiny?.name || 'UNKNOWN DESTINY'}</div><div className="text-[10px] text-gray-400 leading-relaxed">{character.destiny?.description || 'No data found.'}</div></div>
                    <div className="border border-red-900/30 bg-red-950/10 p-3"><div className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1">Active Protocol (Curse)</div><div className="text-sm font-bold text-red-400 uppercase">{character.darkMark?.name || 'NO ACTIVE PROTOCOL'}</div><div className="text-[10px] text-red-300/80 leading-relaxed">{character.darkMark?.description || 'Data corrupted or missing.'}</div></div>
                    <div><div className="text-[9px] font-bold text-purple-500 uppercase tracking-widest mb-1">Origin Source</div><div className="text-sm font-bold text-purple-400 uppercase">{character.master || 'UNKNOWN ORIGIN'}</div></div>
                </div>
                <button onClick={() => setViewData(false)} className="w-full mt-6 border border-cyan-900 text-cyan-500 py-3 uppercase text-xs font-bold hover:bg-cyan-900/20 transition-colors">Terminate Link</button>
            </div>
        </div>
      )}

      {/* PROMOTION MODAL */}
      {viewPromotion && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setViewPromotion(false)}>
              <div className="w-full max-w-sm border border-yellow-500 bg-yellow-900/20 p-6 relative shadow-[0_0_50px_rgba(234,179,8,0.3)]" onClick={e => e.stopPropagation()}>
                  <div className="text-center mb-6"><h2 className="text-2xl font-black italic text-yellow-400 uppercase tracking-tighter">PROMOTION AUTHORIZED</h2><div className="text-[10px] text-yellow-600 font-mono">SELECT UPGRADE MODULE</div></div>
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">{['PHY', 'SPD', 'COG', 'DRV', 'CHA', 'SPR'].map(stat => (<button key={stat} onClick={() => promoteUnit('stat', stat)} className="bg-black/40 border border-yellow-600/30 hover:border-yellow-400 p-3 text-left group"><div className="text-[9px] text-gray-400 group-hover:text-yellow-400 transition-colors">UPGRADE</div><div className="text-lg font-bold text-white">{stat} +1</div></button>))}</div>
                      <div className="border-t border-yellow-600/30 pt-4 mt-2"><div className="text-[9px] text-center text-gray-500 mb-2 uppercase tracking-widest">Or Fortify Vitals</div><div className="flex gap-2"><button onClick={() => promoteUnit('vital', 'life')} className="flex-1 bg-green-900/20 border border-green-700/50 p-3 text-center hover:bg-green-900/40"><div className="text-[9px] text-green-500 font-bold uppercase">MAX LIFE</div><div className="text-xl text-white font-black">+2</div></button><button onClick={() => promoteUnit('vital', 'sanity')} className="flex-1 bg-blue-900/20 border border-blue-700/50 p-3 text-center hover:bg-blue-900/40"><div className="text-[9px] text-blue-500 font-bold uppercase">MAX SANITY</div><div className="text-xl text-white font-black">+2</div></button></div></div>
                  </div>
                  <button onClick={() => setViewPromotion(false)} className="w-full mt-6 text-gray-500 text-[10px] uppercase hover:text-white">Cancel Promotion</button>
              </div>
          </div>
      )}
    </div>
  );
}

export default App;