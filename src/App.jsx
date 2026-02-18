import { useState, useEffect } from 'react';
import { FORMS, DESTINIES } from './data/reference';
import { GEAR_STATS, WEAPON_TABLE, LOOT_PREFIXES } from './data/gear'; 
import { SKILL_CATEGORIES } from './data/skills';

// FIREBASE IMPORTS
import { auth, googleProvider, db } from './firebase'; 
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, updateDoc, doc } from "firebase/firestore";

// --- UTILS (Outside Component) ---
const rollD20 = () => Math.floor(Math.random() * 20) + 1;
const XP_THRESHOLD = 100; // XP needed to level up

function App() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ROSTER'); 
  const [roster, setRoster] = useState([]); 
  
  // ROLLER & MODAL STATE
  const [rollResult, setRollResult] = useState(null);
  const [viewData, setViewData] = useState(false); // Datalink Modal
  const [viewPromotion, setViewPromotion] = useState(false); // NEW: Promotion Modal

  // CREATOR STATE
  const [step, setStep] = useState(1); 
  const initialCharacter = {
    name: "UNIT_UNNAMED",
    rank: 1,         // NEW
    xp: 0,           // NEW
    upgrades: {},    // NEW: Stores permanent stat boosts { PHY: 1, life: 2 }
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

  // --- HELPER: MAX VITALS (UPDATED FOR UPGRADES) ---
  const getMaxVital = (type, charData = character) => {
    if (!charData.form) return 10;
    const statMap = { life: 'PHY', sanity: 'DRV', aura: 'SPR' };
    const baseStat = charData.form.baseStats[statMap[type]] || 10;
    
    // Formula: 9 + (Base / 5) + Destiny Bonus + Permanent Upgrades
    let total = 9 + Math.floor(baseStat / 5);
    
    if (charData.destiny?.bonuses?.[type]) {
      total += charData.destiny.bonuses[type];
    }
    if (charData.upgrades?.[type]) {
        total += charData.upgrades[type];
    }
    
    return total;
  };

  // --- HELPER: GET STAT (UPDATED FOR UPGRADES) ---
  const getStat = (n) => {
    if (!character.form) return 10;
    let val = character.form.baseStats[n];
    
    // Add Permanent Upgrade if exists
    if (character.upgrades?.[n]) {
        val += character.upgrades[n];
    }
    // Add Destiny Bonus if exists
    if (character.destiny?.bonuses?.[n]) {
        val += character.destiny.bonuses[n];
    }
    return val;
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
    // PATCH LEGACY DATA
    if (!charData.currentVitals) {
        charData.currentVitals = {
            life: getMaxVital('life', charData),
            sanity: getMaxVital('sanity', charData),
            aura: getMaxVital('aura', charData)
        };
    }
    if (!charData.rank) charData.rank = 1;
    if (!charData.xp) charData.xp = 0;
    if (!charData.upgrades) charData.upgrades = {};

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

    if (character.id) {
        try { await updateDoc(doc(db, "characters", character.id), { [`currentVitals.${type}`]: newVal }); } catch (e) { console.error("Sync Failed:", e); }
    }
  };

  // --- XP & PROMOTION SYSTEM ---
  const addXp = async (amount) => {
      if (!character.id) return;
      const currentXp = character.xp || 0;
      const newXp = Math.min(XP_THRESHOLD, currentXp + amount); // Cap at 100 for visual clarity until promoted
      
      const updatedChar = { ...character, xp: newXp };
      setCharacter(updatedChar);
      
      try {
          await updateDoc(doc(db, "characters", character.id), { xp: newXp });
      } catch(e) { console.error("XP Sync Failed", e); }
  };

  const promoteUnit = async (upgradeType, upgradeKey) => {
      if (!character.id) return;
      
      // 1. Calculate new values
      const newRank = (character.rank || 1) + 1;
      const currentUpgrades = character.upgrades || {};
      const newBonus = (currentUpgrades[upgradeKey] || 0) + (upgradeType === 'stat' ? 1 : 2); // +1 for Stats, +2 for Vitals
      const newUpgrades = { ...currentUpgrades, [upgradeKey]: newBonus };
      
      // 2. Update Local State
      const updatedChar = { 
          ...character, 
          rank: newRank, 
          xp: 0, // Reset XP
          upgrades: newUpgrades 
      };
      
      // Recalculate Vitals if we upgraded a Vital
      if (upgradeType === 'vital') {
          updatedChar.currentVitals = {
              ...updatedChar.currentVitals,
              [upgradeKey]: (updatedChar.currentVitals[upgradeKey] || 0) + 2
          };
      }

      setCharacter(updatedChar);
      setViewPromotion(false); // Close Modal

      // 3. Sync to Cloud
      try {
          await updateDoc(doc(db, "characters", character.id), {
              rank: newRank,
              xp: 0,
              upgrades: newUpgrades,
              [`currentVitals.${upgradeKey}`]: upgradeType === 'vital' ? updatedChar.currentVitals[upgradeKey] : character.currentVitals[upgradeKey] || 0
          });
          alert(`PROMOTION SUCCESSFUL. UNIT RANK: ${newRank}`);
      } catch(e) {
          console.error("Promotion Failed", e);
          alert("Database Error during Promotion.");
      }
  };

  // --- DICE ENGINE ---
  const performRoll = (skillName, target) => {
    const roll = rollD20(); 
    let type = 'FAIL';
    if (roll === 1) type = 'CRIT'; 
    else if (roll === 20) type = 'JAM'; 
    else if (roll <= target) type = 'SUCCESS';
    setRollResult({ roll, target, type, skill: skillName });
  };

  // --- LOOT ENGINE ---
  const generateLoot = async () => {
    if (!character.id) { alert("COMMAND REJECTED: Unit must be synced to database."); return; }

    const roll = Math.floor(Math.random() * 100) + 1;
    let prefix = { name: "Standard Issue", chance: 40 };
    if (LOOT_PREFIXES) {
        let cumulative = 0;
        for (let p of LOOT_PREFIXES) {
            cumulative += p.chance;
            if (roll <= cumulative) { prefix = p; break; }
        }
    }

    const randomWeapon = WEAPON_TABLE[Math.floor(Math.random() * WEAPON_TABLE.length)];
    const tiers = Object.keys(GEAR_STATS.weapons); 
    const selectedTier = tiers[Math.floor(Math.random() * 5)];
    const fullName = `${prefix.name === "Standard Issue" ? "" : prefix.name + " "}${selectedTier} ${randomWeapon.name}`;

    const currentEquip = character.destiny?.equipment || [];
    const newEquip = [...currentEquip, fullName];

    try {
        const charRef = doc(db, "characters", character.id);
        setCharacter(prev => ({ ...prev, destiny: { ...prev.destiny, equipment: newEquip } }));
        await updateDoc(charRef, { "destiny.equipment": newEquip });
    } catch (e) { console.error("Loot Gen Failed:", e); }
  };

  const removeLoot = async (indexToRemove) => {
    if (!character.id) return;
    const itemToRemove = character.destiny.equipment[indexToRemove];
    if (!window.confirm(`CONFIRM: Drop ${itemToRemove}?`)) return;

    const currentEquip = character.destiny?.equipment || [];
    const newEquip = currentEquip.filter((_, index) => index !== indexToRemove);

    try {
        const charRef = doc(db, "characters", character.id);
        setCharacter(prev => ({ ...prev, destiny: { ...prev.destiny, equipment: newEquip } }));
        await updateDoc(charRef, { "destiny.equipment": newEquip });
    } catch (e) { console.error("Loot Removal Failed:", e); }
  };

  // --- UI HELPERS ---
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
    const cleanName = itemString.replace(tierKey, "").replace("Weapon", "").trim();
    const archetype = !isArmor ? WEAPON_TABLE.find(w => cleanName.includes(w.name) || w.name.includes(cleanName)) : null;
    const finalStats = { ...baseStats };
    if (archetype) {
        finalStats.att += archetype.stats.att;
        finalStats.agm += archetype.stats.agm;
        finalStats.dmg += archetype.stats.dmg;
        finalStats.tgt += archetype.stats.tgt;
    }
    return { tier: tierKey, isArmor, stats: finalStats, name: archetype ? archetype.name : cleanName };
  };

  const getSkillTotal = (skillId, statName, categoryId) => {
    if (!character.form) return 0;
    const baseVal = getStat(statName); // UPDATED TO USE getStat wrapper
    let bonus = 0;
    if (character.destiny?.bonuses) {
        if (character.destiny.bonuses[skillId]) bonus += character.destiny.bonuses[skillId];
        if (character.destiny.bonuses[categoryId]) bonus += character.destiny.bonuses[categoryId];
    }
    return baseVal + bonus;
  };

  // --- RENDER ---
  if (loading) return <div className="h-screen bg-black text-red-600 flex items-center justify-center font-mono">INITIALIZING...</div>;

  if (!user) {
    return (
      <div className="h-screen w-full bg-black text-white font-mono flex flex-col items-center justify-center p-6 scanlines">
        <div className="border border-red-900/50 p-8 bg-red-950/10 max-w-sm w-full text-center">
          <h1 className="text-3xl font-black italic text-red-600 uppercase tracking-tighter mb-2">ASTRO INFERNO</h1>
          <button onClick={handleLogin} className="w-full bg-red-600 text-white py-4 font-bold uppercase tracking-widest hover:bg-white hover:text-red-600 transition-colors mt-8">Identify With Google</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white font-mono overflow-hidden relative">
      
      {/* HEADER */}
      <div className="h-14 border-b border-red-900/50 flex items-center px-4 justify-between bg-red-950/20 shrink-0">
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
      <div className="flex-1 overflow-y-auto pb-24 custom-scrollbar">
        
        {/* TAB 1: ROSTER */}
        {activeTab === 'ROSTER' && (
           <div className="p-4 space-y-4 animate-in fade-in">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">Deployable Units</div>
              {roster.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                   <div className="text-4xl mb-2">∅</div>
                   <div>No Units Found</div>
                </div>
              ) : (
                roster.map(char => (
                  <div key={char.id} className="w-full bg-white/5 border border-white/10 p-4 flex justify-between items-center group relative overflow-hidden">
                     <button onClick={() => loadCharacter(char)} className="flex-1 text-left z-10">
                        <div className="flex items-center gap-2">
                            <div className="text-lg font-black italic uppercase group-hover:text-red-500 transition-colors">{char.name}</div>
                            {/* RANK BADGE */}
                            <div className="bg-yellow-600/20 border border-yellow-600/50 text-yellow-500 text-[9px] px-1 font-bold">RK {char.rank || 1}</div>
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase">{char.form?.name} • {char.destiny?.name}</div>
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
          <div className="p-6 animate-in fade-in duration-300">
             {/* ... CREATOR CODE REMAINS SAME (Abbreviated for length, paste previously provided creator code if needed, but Step 1-4 logic is unchanged) ... */}
             {step === 1 && (
               <div className="space-y-6">
                 <h2 className="text-3xl font-black uppercase">Initialize</h2>
                 <input type="text" value={character.name === "UNIT_UNNAMED" ? "" : character.name} placeholder="ENTER_NAME" className="w-full bg-white/5 border-b-2 border-red-600 p-4 text-xl font-bold uppercase focus:outline-none" onChange={(e) => setCharacter({...character, name: e.target.value.toUpperCase()})} />
                 <button onClick={() => setStep(2)} className="w-full bg-red-600 py-4 font-bold uppercase">Next Phase</button>
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
          <div className="p-4 space-y-6 animate-in slide-in-from-bottom-5">
            <div className="border-2 border-white/10 p-4 bg-white/5 relative overflow-hidden">
                
                {/* NEW: XP & RANK BAR */}
                <div className="mb-4">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                        <span>Rank {character.rank}</span>
                        <span>{character.xp} / {XP_THRESHOLD} XP</span>
                    </div>
                    {/* XP Progress Bar */}
                    <div className="h-1.5 w-full bg-gray-800 relative overflow-hidden mb-2">
                        <div 
                            style={{width: `${Math.min(100, (character.xp / XP_THRESHOLD) * 100)}%`}} 
                            className={`h-full transition-all duration-300 ${character.xp >= XP_THRESHOLD ? 'bg-yellow-400 animate-pulse' : 'bg-yellow-600'}`}
                        ></div>
                    </div>
                    {/* XP Controls */}
                    <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                            <button onClick={() => addXp(1)} className="bg-white/5 border border-white/10 text-[9px] px-2 py-1 text-gray-400 hover:text-white">+1 XP</button>
                            <button onClick={() => addXp(5)} className="bg-white/5 border border-white/10 text-[9px] px-2 py-1 text-gray-400 hover:text-white">+5 XP</button>
                        </div>
                        {character.xp >= XP_THRESHOLD && (
                            <button 
                                onClick={() => setViewPromotion(true)}
                                className="bg-yellow-500 text-black text-[9px] font-black px-3 py-1 uppercase animate-bounce"
                            >
                                ▲ PROMOTION AVAILABLE
                            </button>
                        )}
                    </div>
                </div>

                {/* HEADER WITH DATALINK */}
                <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
                    <div>
                        <div className="text-2xl font-black italic uppercase leading-none">{character.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">ID: 894-XJ • RK {character.rank}</div>
                    </div>
                    <button 
                        onClick={() => setViewData(true)} 
                        className="bg-white/10 hover:bg-white/20 border border-white/10 text-[9px] px-2 py-1 uppercase text-cyan-400 font-bold tracking-widest"
                    >
                        :: DATALINK
                    </button>
                </div>
                
                {/* VITALS */}
                <div className="space-y-2 mb-6">
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

                {/* STATS */}
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

                {/* ARMORY & LOOT */}
                {character.destiny && (
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <div className="flex justify-between items-end mb-3 border-b border-white/10 pb-1">
                             <div className="text-[10px] uppercase text-gray-500 tracking-widest">Loadout</div>
                             <button 
                                 onClick={generateLoot}
                                 className="text-[9px] bg-red-600 text-white px-2 py-1 font-bold uppercase hover:bg-white hover:text-red-600 transition-colors animate-pulse"
                             >
                                 + Generate Loot
                             </button>
                        </div>
                        <div className="space-y-2">
                            {character.destiny.equipment.map((item, i) => {
                                const gear = getGearStats(item);
                                const rarityColor = getLootColor(item);

                                if (gear) return (
                                    <div key={i} className="flex justify-between items-center bg-white/5 border border-white/10 p-2 group hover:bg-white/10 transition-colors">
                                        <div className="flex-1">
                                            <div className={`text-[9px] font-bold uppercase ${rarityColor}`}>{gear.name}</div>
                                            <div className="flex gap-2">
                                                {!gear.isArmor && <span className="text-gray-500 text-[9px] font-bold">DMG {toRoman(gear.stats.dmg)}</span>}
                                                {gear.isArmor && <span className="text-blue-500 text-[9px] font-bold">ARM {gear.stats.arm}</span>}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => removeLoot(i)}
                                            className="text-gray-600 hover:text-red-500 font-bold px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            X
                                        </button>
                                    </div>
                                );
                                return (
                                    <div key={i} className="flex justify-between items-center bg-white/5 border border-white/10 p-2 text-[9px] uppercase">
                                        <span className={rarityColor}>{item}</span>
                                        <button onClick={() => removeLoot(i)} className="text-gray-600 hover:text-red-500 font-bold px-2 py-1 text-xs">X</button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
            <button onClick={() => setActiveTab('ROSTER')} className="w-full border border-white/10 text-gray-500 py-3 uppercase text-xs hover:border-white hover:text-white transition-colors">Return to Barracks</button>
          </div>
        )}
      </div>

      {/* --- MODAL: ROLL RESULT --- */}
      {rollResult && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-100" onClick={() => setRollResult(null)}>
           <div className={`w-full max-w-sm border-2 p-8 text-center shadow-[0_0_30px_rgba(0,0,0,0.5)] transform scale-100 transition-all ${
               rollResult.type === 'CRIT' ? 'border-yellow-500 bg-yellow-900/20' :
               rollResult.type === 'SUCCESS' ? 'border-green-500 bg-green-900/20' :
               rollResult.type === 'JAM' ? 'border-red-600 bg-red-900/20 border-dashed' :
               'border-red-800 bg-red-950/40' // FAIL
           }`}>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-white opacity-70">Resolution Protocol</div>
              <div className="text-6xl font-black mb-2 text-white drop-shadow-md">{rollResult.roll}</div>
              <div className={`text-2xl font-black uppercase italic tracking-tighter mb-6 ${
                  rollResult.type === 'CRIT' ? 'text-yellow-400' :
                  rollResult.type === 'SUCCESS' ? 'text-green-500' :
                  rollResult.type === 'JAM' ? 'text-red-600 animate-pulse' :
                  'text-red-800'
              }`}>
                {rollResult.type === 'CRIT' ? 'HOT STREAK' : rollResult.type === 'JAM' ? 'FATAL ERROR' : rollResult.type}
              </div>
              <div className="flex justify-between border-t border-white/20 pt-4 text-xs font-mono text-gray-400">
                <div>SKILL: {rollResult.skill}</div>
                <div>TARGET: ≤{rollResult.target}</div>
              </div>
              <div className="mt-8 text-[9px] uppercase tracking-widest text-gray-500 animate-pulse">Tap anywhere to dismiss</div>
           </div>
        </div>
      )}

      {/* --- MODAL: DATALINK --- */}
      {viewData && character.form && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setViewData(false)}>
            <div className="w-full max-w-sm border border-cyan-900/50 bg-cyan-950/10 p-6 relative shadow-[0_0_50px_rgba(8,145,178,0.2)]" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500"></div>
                <div className="text-center mb-6 border-b border-cyan-500/20 pb-4">
                    <h2 className="text-xl font-black italic text-cyan-400 uppercase tracking-tighter">DATA_UPLINK</h2>
                    <div className="text-[9px] text-cyan-600 font-mono">SECURE CONNECTION ESTABLISHED</div>
                </div>
                <div className="space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar pr-2">
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Identity Config</div>
                        <div className="text-lg font-bold text-white uppercase">{character.form.name}</div>
                        <div className="text-[10px] text-gray-400 leading-relaxed mb-2">{character.form.description}</div>
                        <div className="text-sm font-bold text-white uppercase mt-2">{character.destiny.name}</div>
                        <div className="text-[10px] text-gray-400 leading-relaxed">{character.destiny.description}</div>
                    </div>
                    <div className="border border-red-900/30 bg-red-950/10 p-3">
                        <div className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1">Active Protocol (Curse)</div>
                        <div className="text-sm font-bold text-red-400 uppercase">{character.darkMark.name}</div>
                        <div className="text-[10px] text-red-300/80 leading-relaxed">{character.darkMark.description}</div>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-purple-500 uppercase tracking-widest mb-1">Origin Source</div>
                        <div className="text-sm font-bold text-purple-400 uppercase">{character.master}</div>
                    </div>
                </div>
                <button onClick={() => setViewData(false)} className="w-full mt-6 border border-cyan-900 text-cyan-500 py-3 uppercase text-xs font-bold hover:bg-cyan-900/20 transition-colors">Terminate Link</button>
            </div>
        </div>
      )}

      {/* --- NEW: MODAL: PROMOTION --- */}
      {viewPromotion && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setViewPromotion(false)}>
              <div className="w-full max-w-sm border border-yellow-500 bg-yellow-900/20 p-6 relative shadow-[0_0_50px_rgba(234,179,8,0.3)]" onClick={e => e.stopPropagation()}>
                  <div className="text-center mb-6">
                      <h2 className="text-2xl font-black italic text-yellow-400 uppercase tracking-tighter">PROMOTION AUTHORIZED</h2>
                      <div className="text-[10px] text-yellow-600 font-mono">SELECT UPGRADE MODULE</div>
                  </div>
                  
                  <div className="space-y-4">
                      {/* STAT UPGRADES */}
                      <div className="grid grid-cols-2 gap-2">
                          {['PHY', 'SPD', 'COG', 'DRV', 'CHA', 'SPR'].map(stat => (
                              <button 
                                  key={stat} 
                                  onClick={() => promoteUnit('stat', stat)}
                                  className="bg-black/40 border border-yellow-600/30 hover:border-yellow-400 p-3 text-left group"
                              >
                                  <div className="text-[9px] text-gray-400 group-hover:text-yellow-400 transition-colors">UPGRADE</div>
                                  <div className="text-lg font-bold text-white">{stat} +1</div>
                              </button>
                          ))}
                      </div>

                      {/* VITAL UPGRADES */}
                      <div className="border-t border-yellow-600/30 pt-4 mt-2">
                         <div className="text-[9px] text-center text-gray-500 mb-2 uppercase tracking-widest">Or Fortify Vitals</div>
                         <div className="flex gap-2">
                             <button onClick={() => promoteUnit('vital', 'life')} className="flex-1 bg-green-900/20 border border-green-700/50 p-3 text-center hover:bg-green-900/40">
                                 <div className="text-[9px] text-green-500 font-bold uppercase">MAX LIFE</div>
                                 <div className="text-xl text-white font-black">+2</div>
                             </button>
                             <button onClick={() => promoteUnit('vital', 'sanity')} className="flex-1 bg-blue-900/20 border border-blue-700/50 p-3 text-center hover:bg-blue-900/40">
                                 <div className="text-[9px] text-blue-500 font-bold uppercase">MAX SANITY</div>
                                 <div className="text-xl text-white font-black">+2</div>
                             </button>
                         </div>
                      </div>
                  </div>

                  <button onClick={() => setViewPromotion(false)} className="w-full mt-6 text-gray-500 text-[10px] uppercase hover:text-white">Cancel Promotion</button>
              </div>
          </div>
      )}

    </div>
  );
}

export default App;