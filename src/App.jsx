import { useState } from 'react';
import { FORMS, DESTINIES, GEAR_STATS, WEAPON_TABLE } from './data/reference';

function App() {
  const [step, setStep] = useState(1); 
  
  // INITIAL STATE OBJECT
  const initialCharacter = {
    name: "UNIT_UNNAMED",
    form: null,      
    destiny: null,   
    master: null,    
    darkMark: null,  
    innerDemon: null 
  };

  const [character, setCharacter] = useState(initialCharacter);

  // ACTION: RESET APP (The Loop)
  const resetApp = () => {
    // Optional: Add actual saving logic here (e.g. localStorage or API)
    console.log("Saving Character:", character);
    
    // Reset UI
    setStep(1);
    setCharacter(initialCharacter);
  };

  // HELPER: Calculate Vitals
  const getStat = (statName) => {
    if (!character.form) return 10;
    return character.form.baseStats[statName] || 10;
  };

  const getVital = (type) => {
    const statMap = { life: 'PHY', sanity: 'DRV', aura: 'SPR' };
    const baseStat = getStat(statMap[type]);
    let total = 9 + Math.floor(baseStat / 5);
    
    if (character.destiny && character.destiny.bonuses) {
      if (character.destiny.bonuses[type]) {
        total += character.destiny.bonuses[type];
      }
    }
    return total;
  };

  const toRoman = (num) => {
    const roman = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII' };
    return roman[Math.max(1, Math.min(7, num))] || num; 
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

    return { 
        tier: tierKey, 
        isArmor, 
        stats: finalStats, 
        name: archetype ? archetype.name : (cleanName || "Standard Issue"),
        category: archetype ? archetype.category : "Standard"
    };
  };

  return (
    <div className="flex h-screen w-full bg-black text-white font-mono overflow-hidden scanlines">
      
      {/* ================= LEFT PANEL ================= */}
      <div className="w-1/2 flex flex-col border-r border-red-900/50 relative z-20 bg-black">
        <div className="h-16 border-b border-red-900/50 flex items-center px-6 justify-between bg-red-950/10 shrink-0">
          <h1 className="text-xl font-black italic tracking-tighter text-red-600 uppercase">
            Astro Inferno <span className="text-xs text-gray-500 not-italic">v1.4</span>
          </h1>
          <div className="flex gap-2">
             {[1,2,3,4].map(s => <div key={s} className={`h-2 w-2 rounded-full ${step >= s ? 'bg-red-600' : 'bg-gray-800'}`} />)}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-left-4">
              <h2 className="text-4xl font-black uppercase mb-8">Initialize Unit</h2>
              <input 
                type="text" 
                value={character.name === "UNIT_UNNAMED" ? "" : character.name}
                placeholder="ENTER_NAME" 
                className="w-full bg-transparent border-b-2 border-white/20 py-2 text-2xl font-bold uppercase focus:border-red-600 focus:outline-none" 
                onChange={(e) => setCharacter({...character, name: e.target.value.toUpperCase()})} 
              />
              <button onClick={() => setStep(2)} className="mt-12 text-red-500 uppercase font-bold text-sm">Proceed →</button>
            </div>
          )}
          
          {/* STEP 2: FORM */}
          {step === 2 && (
             <div className="animate-in fade-in slide-in-from-left-4">
               <h2 className="text-2xl font-black uppercase text-red-600 mb-6">Select Form</h2>
               <div className="grid grid-cols-1 gap-3">
                 {FORMS.map(form => (
                   <button key={form.id} onClick={() => setCharacter({...character, form: form, darkMark: null, master: null})} className={`text-left p-4 border transition-all ${character.form?.id === form.id ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500'}`}>
                     <span className="font-bold uppercase text-sm">{form.name}</span>
                     <div className="text-xs opacity-80">{form.description}</div>
                   </button>
                 ))}
               </div>
               <div className="flex justify-between mt-8 pt-4 border-t border-white/10">
                  <button onClick={() => setStep(1)} className="text-gray-500 text-xs">BACK</button>
                  <button disabled={!character.form} onClick={() => setStep(3)} className="bg-red-600 text-white px-6 py-2 font-bold text-xs uppercase disabled:opacity-50">Confirm</button>
               </div>
             </div>
          )}

          {/* STEP 3: DESTINY */}
          {step === 3 && (
             <div className="animate-in fade-in slide-in-from-left-4">
               <h2 className="text-2xl font-black uppercase text-red-600 mb-6">Select Destiny</h2>
               <div className="grid grid-cols-2 gap-2">
                 {DESTINIES.map(destiny => (
                   <button key={destiny.id} onClick={() => setCharacter({...character, destiny: destiny})} className={`text-left p-3 border transition-all ${character.destiny?.id === destiny.id ? 'bg-red-600 text-white border-red-600' : 'border-white/10 text-gray-500'}`}>
                     <span className="font-bold uppercase text-sm">{destiny.name}</span>
                   </button>
                 ))}
               </div>
               <div className="flex justify-between mt-8 pt-4 border-t border-white/10">
                  <button onClick={() => setStep(2)} className="text-gray-500 text-xs">BACK</button>
                  <button disabled={!character.destiny} onClick={() => setStep(4)} className="bg-white text-black px-6 py-2 font-bold text-xs uppercase disabled:opacity-50">Confirm</button>
               </div>
             </div>
          )}

          {/* STEP 4: FINALIZATION */}
          {step === 4 && (
             <div className="animate-in fade-in slide-in-from-left-4">
               <h2 className="text-2xl font-black uppercase text-red-600 mb-6">Final Sequencing</h2>
               
               {/* 1. MASTER ROLL */}
               <div className="mb-6 p-4 bg-white/5 border border-white/10">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-gray-400 uppercase">Entity Bond (Master)</span>
                   <button 
                     onClick={() => {
                       const roll = Math.floor(Math.random() * 20) + 1;
                       const masterTable = character.form.tables.master;
                       const result = masterTable.find(m => roll >= m.min && roll <= m.max);
                       setCharacter({...character, master: result ? `${result.label} (Roll: ${roll})` : "Unknown Entity"});
                     }}
                     className="text-[10px] text-red-500 border border-red-500 px-2 py-1 hover:bg-red-500 hover:text-black uppercase"
                   >
                     {character.master ? "Reroll Connection" : "Initiate Bond"}
                   </button>
                 </div>
                 <div className="text-xl font-black text-white uppercase tracking-wider">
                   {character.master || "UNSEVERED"}
                 </div>
               </div>

               {/* 2. DARK MARK SELECTION */}
               <div className="mb-6">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">Select Dark Mark</span>
                    <button 
                      onClick={() => {
                        // Randomly pick one
                        const marks = character.form.darkMarks;
                        const randomMark = marks[Math.floor(Math.random() * marks.length)];
                        setCharacter({...character, darkMark: randomMark});
                      }}
                      className="text-[10px] text-blue-500 border border-blue-500 px-2 py-1 hover:bg-blue-500 hover:text-black uppercase"
                    >
                      Randomize
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-2">
                   {character.form?.darkMarks.map((mark, i) => (
                     <button
                       key={i}
                       onClick={() => setCharacter({...character, darkMark: mark})}
                       className={`text-left p-3 border transition-all ${
                         character.darkMark?.name === mark.name 
                           ? 'bg-blue-900/20 border-blue-500 text-white' 
                           : 'bg-transparent border-white/10 text-gray-500 hover:border-white'
                       }`}
                     >
                       <div className="text-sm font-bold uppercase">{mark.name}</div>
                       <div className="text-[10px] opacity-70">{mark.description}</div>
                     </button>
                   ))}
                 </div>
               </div>

               {/* 3. INNER DEMON */}
               {character.destiny?.innerDemon && (
                 <div className="mb-6 p-4 bg-red-900/10 border border-red-500/30">
                    <span className="text-xs font-bold text-red-400 uppercase block mb-1">Inner Demon Protocol</span>
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-white">{character.destiny.innerDemon.roll}</span>
                      <span className="text-[10px] bg-red-600 text-white px-2 py-1">{character.destiny.innerDemon.stat}</span>
                    </div>
                 </div>
               )}

               {/* RESET BUTTON */}
               <button 
                 onClick={resetApp}
                 className="w-full border border-green-500 text-green-500 py-4 uppercase font-bold hover:bg-green-500 hover:text-black transition-colors mt-4"
               >
                 Save & Restart Sequence
               </button>
             </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT PANEL: LIVE SHEET ================= */}
      <div className="w-1/2 bg-[#050505] relative flex flex-col h-full overflow-hidden">
        <div className="relative z-10 h-full overflow-y-auto p-8 custom-scrollbar">
          <div className="border-2 border-white/10 p-6 min-h-full flex flex-col bg-black/50 backdrop-blur-sm">
            
            {/* IDENTITY HEADER */}
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-6">
              <div>
                 <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Subject Name</div>
                 <div className="text-4xl font-black uppercase italic tracking-tighter text-white">{character.name}</div>
              </div>
              <div className="text-right"><div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">ID Key</div><div className="text-xl font-mono text-red-600">894-XJ</div></div>
            </div>

            {/* VITALS & STATS */}
            {character.form && (
              <div className="mb-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                   {['life', 'sanity', 'aura'].map(vital => (
                     <div key={vital} className="text-center">
                        <div className="text-[10px] uppercase tracking-widest mb-1 text-gray-400">{vital}</div>
                        <div className={`text-3xl font-black ${vital === 'life' ? 'text-green-500' : vital === 'sanity' ? 'text-blue-500' : 'text-purple-500'}`}>{getVital(vital)}</div>
                        <div className="h-1 w-full bg-gray-800 mt-2"><div style={{width: `${(getVital(vital)/20)*100}%`}} className={`h-full ${vital === 'life' ? 'bg-green-600' : vital === 'sanity' ? 'bg-blue-600' : 'bg-purple-600'}`}></div></div>
                     </div>
                   ))}
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                   {['PHY', 'SPD', 'COG', 'DRV', 'CHA', 'SPR'].map(stat => (
                     <div key={stat} className="flex justify-between border-b border-white/10 pb-1">
                        <div><span className="text-sm font-bold text-gray-500 mr-2">{stat}</span><span className="text-[9px] text-red-800 italic">{character.form.qualities[stat]}</span></div>
                        <div className="text-xl font-bold text-white">{character.form.baseStats[stat]}</div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {/* LORE SECTION */}
            {(character.master || character.darkMark) && (
              <div className="mb-8 border-t border-white/10 pt-4 animate-in slide-in-from-bottom-2">
                 <div className="flex justify-between mb-4">
                   <div className="w-1/2 pr-2">
                     <div className="text-[9px] uppercase text-gray-500">Master</div>
                     <div className="text-sm font-bold text-purple-400 uppercase">{character.master || "PENDING..."}</div>
                   </div>
                   <div className="w-1/2 pl-2 text-right">
                     <div className="text-[9px] uppercase text-gray-500">Dark Mark</div>
                     <div className="text-sm font-bold text-blue-400 uppercase">{character.darkMark?.name || "PENDING..."}</div>
                   </div>
                 </div>
                 {character.darkMark && (
                   <div className="text-[10px] text-gray-400 italic text-center border border-white/5 p-2">
                     "{character.darkMark.description}"
                   </div>
                 )}
              </div>
            )}

            {/* ARMORY SECTION */}
            {character.destiny && (
              <div className="mt-auto pt-4 border-t border-white/10 animate-in slide-in-from-bottom-2">
                 <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">Loadout</div>
                 <div className="flex flex-col gap-2">
                   {character.destiny.equipment.map((item, i) => {
                     const gear = getGearStats(item);
                     
                     if (gear) {
                       return (
                         <div key={i} className="flex justify-between items-center bg-white/5 border border-white/10 p-2 hover:border-red-600 transition-colors group">
                           <div>
                             <div className="text-[10px] font-bold uppercase text-white group-hover:text-red-500">{gear.name}</div>
                             <div className="text-[8px] text-gray-500 uppercase">{gear.tier} • {gear.category}</div>
                           </div>
                           <div className="flex gap-3 text-right">
                             {gear.isArmor ? (
                                <div className="text-center"><div className="text-[8px] text-gray-500">ARM</div><div className="text-sm font-bold text-blue-400">{gear.stats.arm}</div></div>
                             ) : (
                                <>
                                  <div className="text-center"><div className="text-[8px] text-gray-500">ATT</div><div className={`text-sm font-bold ${gear.stats.att > 0 ? 'text-green-500' : 'text-gray-400'}`}>{gear.stats.att > 0 ? '+' : ''}{gear.stats.att}</div></div>
                                  <div className="text-center"><div className="text-[8px] text-gray-500">DMG</div><div className="text-sm font-bold text-red-500">{toRoman(gear.stats.dmg)}</div></div>
                                  <div className="text-center"><div className="text-[8px] text-gray-500">TGT</div><div className="text-sm font-bold text-yellow-400">{gear.stats.tgt}</div></div>
                                </>
                             )}
                           </div>
                         </div>
                       );
                     }
                     return <div key={i} className="px-3 py-2 bg-white/5 border border-white/10 text-[10px] uppercase text-gray-300">{item}</div>;
                   })}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;