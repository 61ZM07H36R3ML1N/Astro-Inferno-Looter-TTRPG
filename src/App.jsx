import { useState, useEffect } from 'react';

// --- DATA INJECTION ---
import { GEAR_STATS, WEAPON_TABLE, LOOT_PREFIXES, GRENADE_TIERS, GRENADE_JUICE, LOOT_SUFFIXES } from './data/gear'; 
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

// --- GLOBAL UTILS ---
const rollD20 = () => Math.floor(Math.random() * 20) + 1;
const XP_THRESHOLD = 100; 

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
  const [encounter, setEncounter] = useState(null);
  const [bossNameInput, setBossNameInput] = useState("");
  const [bossHpInput, setBossHpInput] = useState("");

  // --- STATE: UNIT CREATOR ---
  const [step, setStep] = useState(1); 
  const initialCharacter = {
    name: "UNIT_UNNAMED", avatarUrl: "", rank: 1, xp: 0,           
    wallet: { blood: 0, honey: 0 }, consumables: { grenades: 0, stims: 0 }, 
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
    if (!user) { alert("ERROR: Identity required."); return; }
    try {
        const token = await requestNotificationPermission();
        if (token) {
            await setDoc(doc(db, "users", user.uid), { fcmToken: token, lastSynced: new Date().getTime() }, { merge: true });
            alert("Neural Link Established.");
        }
    } catch (error) { console.error("Sync Failure:", error); }
  };

  // --- PROCEDURAL FORGE & LOGISTICS ---
  const broadcastLoot = async () => {
    if (!gmSquadId) return;
    const item = generateProceduralLoot();
    try {
        await addDoc(collection(db, "party_loot"), {
            ...item,
            squadId: gmSquadId,
            createdAt: new Date().getTime()
        });
        broadcastEvent(gmSquadId, `NEURAL LINK: Asset deployed to Drop Pod.`, 'success');
    } catch (e) { console.error("Broadcast Failed", e); }
  };

  const spawnBoss = async () => {
    // 1. Safety check: Don't spawn a ghost
    if (!gmSquadId || !bossNameInput || !bossHpInput) {
      alert("COMMAND REJECTED: Overseer must provide Name and HP telemetry.");
      return;
    }
    
    try {
      // 2. Deploy the threat to the database
      const bossData = { 
        name: bossNameInput.toUpperCase(), 
        hp: parseInt(bossHpInput), 
        maxHp: parseInt(bossHpInput) 
      };
      
      await setDoc(doc(db, "encounters", gmSquadId), bossData);
      
      // 3. Announce the threat to the Neural Link
      broadcastEvent(gmSquadId, `WARNING: Hostile Threat Detected - ${bossData.name}`, 'boss');
      
      // 4. Reset Overseer inputs
      setBossNameInput(""); 
      setBossHpInput("");
    } catch (e) { 
      console.error("Boss Deployment Failure:", e); 
    }
  };

  const claimLoot = async (lootItem) => {
      if (!character.id) return;
      const fullName = `[${lootItem.condition}] ${lootItem.tier} ${lootItem.name}`;
      const newEquip = [...(character.destiny?.equipment || []), fullName];
      try {
          await updateDoc(doc(db, "characters", character.id), { "destiny.equipment": newEquip });
          setCharacter(prev => ({ ...prev, destiny: { ...prev.destiny, equipment: newEquip } }));
          await deleteDoc(doc(db, "party_loot", lootItem.id));
          broadcastEvent(character.squadId, `<<< ASSET SECURED: ${character.name} claimed ${fullName}`, 'success');
      } catch (e) { console.error("Loot Claim Failed:", e); }
  };

  const generateLoot = async () => {
    if (!character.id) return;
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

  // --- HELPERS: STATS & VITALS ---
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
    if (itemName.includes("Void-Forged")) return "text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]";
    if (itemName.includes("Satanic")) return "text-red-600";
    if (itemName.includes("Genesis")) return "text-cyan-400";
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
        finalStats.dmg += archetype.stats.dmg + (suffix?.stats?.dmg || 0);
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

  // --- ACTIONS: UNIT MANAGEMENT ---
  const handleLogin = async () => { try { await signInWithPopup(auth, googleProvider); } catch (e) { console.error(e); } };
  const handleLogout = async () => { setGmSquadId(null); setCharacter(initialCharacter); setSquadRoster([]); await signOut(auth); setActiveTab('ROSTER'); };

  const saveCharacter = async () => {
    if (!user || !character.form) return;
    try {
      const { id: dummyId, ...cleanCharacter } = character; 
      const payload = { ...cleanCharacter, currentVitals: { life: getMaxVital('life', character), sanity: getMaxVital('sanity', character), aura: getMaxVital('aura', character) }, uid: user.uid, createdAt: new Date() };
      await addDoc(collection(db, "characters"), payload);
      setCharacter(initialCharacter); setStep(1); setActiveTab('ROSTER');
    } catch (e) { console.error(e); }
  };

  const loadCharacter = (charData) => {
    if (!charData.currentVitals) charData.currentVitals = { life: getMaxVital('life', charData), sanity: getMaxVital('sanity', charData), aura: getMaxVital('aura', charData) };
    setSquadRoster([]); 
    setCharacter(charData);
    setActiveTab('SHEET');
  };

  const updateVital = async (type, change) => {
    const maxVal = getMaxVital(type);
    const currentVal = character.currentVitals?.[type] ?? maxVal;
    let newVal = Math.max(0, Math.min(maxVal, currentVal + change));
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
      const newXp = Math.min(XP_THRESHOLD, (character.xp || 0) + amount);
      setCharacter(p => ({ ...p, xp: newXp }));
      try { await updateDoc(doc(db, "characters", character.id), { xp: newXp }); } catch(e) { console.error(e); }
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
          await updateDoc(doc(db, "characters", character.id), { rank: newRank, xp: 0, upgrades: newUpgrades, [`currentVitals.${upgradeKey}`]: upgradeType === 'vital' ? updatedChar.currentVitals[upgradeKey] : character.currentVitals[upgradeKey] || 0 });
          alert(`PROMOTION SUCCESSFUL. RANK: ${newRank}`);
      } catch(e) { console.error(e); }
  };

  const performRoll = (skillName, baseTarget) => {
    const roll = rollD20(); 
    let type = 'FAIL';
    const activeWeapon = (character.loadout || []).find(item => { const stats = getGearStats(item); return stats && !stats.isArmor; });
    const finalTarget = baseTarget + (activeWeapon ? (getGearStats(activeWeapon)?.stats.att || 0) : 0);
    if (roll === 1) type = 'CRIT';
    else if (roll === 20) type = 'JAM';
    else if (roll <= finalTarget) type = 'SUCCESS';
    setRollResult({ roll, finalTarget, type, skill: skillName });
    if (character.squadId && type === 'CRIT') broadcastEvent(character.squadId, `CRITICAL HIT: ${character.name} on ${skillName}!`, 'success');
  };

  const toggleEquip = async (itemIndex, isCurrentlyEquipped) => {
    if (!character.id) return;
    let newLoadout = [...(character.loadout || [])];
    let newEquip = [...(character.destiny?.equipment || [])];
    if (isCurrentlyEquipped) {
        const item = newLoadout.splice(itemIndex, 1)[0];
        newEquip.push(item);
    } else {
        const item = newEquip.splice(itemIndex, 1)[0];
        newLoadout.push(item);
    }
    try {
        setCharacter(prev => ({ ...prev, loadout: newLoadout, destiny: { ...prev.destiny, equipment: newEquip } }));
        await updateDoc(doc(db, "characters", character.id), { "loadout": newLoadout, "destiny.equipment": newEquip });
    } catch (e) { console.error(e); }
  };

  const removeLoot = async (index, isEquipped) => {
      let l = [...(isEquipped ? character.loadout : character.destiny.equipment)];
      l.splice(index, 1);
      setCharacter(p => ({ ...p, [isEquipped ? "loadout" : "destiny.equipment"]: l }));
      if (character.id) await updateDoc(doc(db, "characters", character.id), { [isEquipped ? "loadout" : "destiny.equipment"]: l });
  };

  // --- ACTIONS: SQUAD HANDLERS ---
  const joinSquad = async (code) => {
      if (!character.id || !code) return;
      const upperCode = code.toUpperCase().trim();
      setCharacter(prev => ({ ...prev, squadId: upperCode }));
      try { 
          await updateDoc(doc(db, "characters", character.id), { squadId: upperCode }); 
          broadcastEvent(upperCode, `>>> UNIT DEPLOYED: ${character.name}`, 'info');
      } catch(e) { console.error(e); }
  };

  const renderCombatLog = () => (
      <div className="border border-white/10 bg-black/60 p-2 mb-4 flex flex-col h-40 shadow-inner relative">
          <div className="text-[8px] text-gray-500 font-bold uppercase mb-2 border-b border-white/10 pb-1">Network Activity Log</div>
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col-reverse">
              {[...squadLogs].reverse().map(log => (
                  <div key={log.id} className="text-[9px] font-mono leading-snug">
                      <span className="text-gray-600 mr-2">[{new Date(log.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}]</span>
                      <span className={`${log.type === 'success' ? 'text-green-400 font-bold' : log.type === 'danger' ? 'text-red-500' : 'text-gray-300'}`}>{log.message}</span>
                  </div>
              ))}
          </div>
      </div>
  );

  // --- RENDER ---
  if (loading) return <div className="h-screen bg-black text-red-600 flex items-center justify-center font-mono">LOADING BARRACKS...</div>;
  if (!user) return (
      <div className="h-screen w-full bg-black text-white font-mono flex flex-col items-center justify-center p-6 scanlines">
          <h1 className="text-3xl font-black italic text-red-600 uppercase mb-8">ASTRO INFERNO</h1>
          <button onClick={handleLogin} className="w-full bg-red-600 text-white py-4 font-bold uppercase hover:bg-white hover:text-red-600 transition-all">Identify With Google</button>
      </div>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white font-mono overflow-hidden relative">
      <div className="h-14 border-b border-red-900/50 flex items-center px-4 justify-between bg-red-950/20 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <img src={user.photoURL} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${user.displayName}&background=7f1d1d&color=f87171`; }} alt="User" className="h-8 w-8 rounded-full border border-red-600 shadow-lg" />
          <div className="text-sm font-black italic text-red-600 uppercase tracking-tighter">ASTRO INFERNO</div>
        </div>
        <div className="flex gap-2">
            <button onClick={testNeuralLink} className="text-[9px] text-cyan-400 border border-cyan-900 px-2 py-1 uppercase animate-pulse">Link Device</button>
            <button onClick={handleLogout} className="text-[9px] text-red-500 border border-red-900 px-2 py-1 uppercase">Log Out</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar relative">
        {activeTab === 'ROSTER' && <RosterTab roster={roster} loadCharacter={loadCharacter} deleteCharacter={(id, name) => { if(window.confirm(`TERMINATE ${name}?`)) deleteDoc(doc(db, "characters", id)); }} />}
        {activeTab === 'CREATOR' && <CreatorTab step={step} setStep={setStep} character={character} setCharacter={setCharacter} saveCharacter={saveCharacter} rollD20={rollD20} />}
        {activeTab === 'SHEET' && <SheetTab character={character} setCharacter={setCharacter} updateVital={updateVital} getMaxVital={getMaxVital} toggleStatus={toggleStatus} addXp={addXp} updateWallet={updateWallet} getStat={getStat} getSkillTotal={getSkillTotal} performRoll={performRoll} getGearStats={getGearStats} generateLoot={generateLoot} toggleEquip={toggleEquip} removeLoot={removeLoot} syncNotes={async () => { if(character.id) await updateDoc(doc(db, "characters", character.id), { notes: character.notes }); }} setViewData={setViewData} setViewPromotion={setViewPromotion} toRoman={toRoman} getLootColor={getLootColor} isLogOpen={isLogOpen} setIsLogOpen={setIsLogOpen} />}
        {activeTab === 'SQUAD' && <SquadTab character={character} squadInput={squadInput} setSquadInput={setSquadInput} joinSquad={joinSquad} leaveSquad={async () => { if(character.id) await updateDoc(doc(db, "characters", character.id), { squadId: null }); setCharacter(p => ({...p, squadId: null})); }} encounter={encounter} squadRoster={squadRoster} getMaxVital={getMaxVital} renderCombatLog={renderCombatLog} partyLoot={partyLoot} claimLoot={claimLoot} claimGroundLoot={claimGroundLoot} />}
        {activeTab === 'OVERSEER' && <OverseerTab gmSquadId={gmSquadId} squadInput={squadInput} setSquadInput={setSquadInput} joinAsGm={(c) => setGmSquadId(c.toUpperCase())} leaveGm={() => setGmSquadId(null)} renderCombatLog={renderCombatLog} encounter={encounter} bossNameInput={bossNameInput} setBossNameInput={setBossNameInput} bossHpInput={bossHpInput} setBossHpInput={setBossHpInput} spawnBoss={spawnBoss} updateBossHp={(c) => updateDoc(doc(db, "encounters", gmSquadId), { hp: Math.max(0, encounter.hp + c) })} clearBoss={() => deleteDoc(doc(db, "encounters", gmSquadId))} squadRoster={squadRoster} getMaxVital={getMaxVital} triggerLootDrop={triggerLootDrop} broadcastLoot={broadcastLoot} />}
      </div>

      <div className="h-16 border-t border-red-900/50 bg-black flex items-center justify-around shrink-0 z-50">
        {['ROSTER', 'SHEET', 'SQUAD', 'OVERSEER'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex flex-col items-center justify-center w-1/4 h-full transition-all ${activeTab === tab ? `bg-${tab==='SQUAD'?'cyan':tab==='OVERSEER'?'purple':'red'}-950/30 border-t-2 border-${tab==='SQUAD'?'cyan-500':tab==='OVERSEER'?'purple-500':'red-600'} text-${tab==='SQUAD'?'cyan-400':tab==='OVERSEER'?'purple-400':'red-500'}` : 'text-gray-600 border-t-2 border-transparent'}`}>
              <span className="text-[9px] font-black uppercase tracking-widest">{tab === 'ROSTER' ? 'Barracks' : tab === 'SHEET' ? 'Unit' : tab}</span>
            </button>
        ))}
      </div>

      <Modals rollResult={rollResult} setRollResult={setRollResult} grenadeResult={grenadeResult} setGrenadeResult={setGrenadeResult} viewData={viewData} setViewData={setViewData} character={character} viewPromotion={viewPromotion} setViewPromotion={setViewPromotion} promoteUnit={promoteUnit} />
    </div>
  );
}

export default App;