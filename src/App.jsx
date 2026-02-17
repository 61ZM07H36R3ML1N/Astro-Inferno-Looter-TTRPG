import { useState } from 'react';
// These must match your filenames in src/data/ exactly
import { FORMS, DESTINIES } from './data/reference';
import { GEAR_STATS, WEAPON_TABLE } from './data/gear';
import { SKILL_CATEGORIES } from './data/skills';

function App() {
  const [step, setStep] = useState(1); 
  const [activeTab, setActiveTab] = useState('CREATOR'); 
  
  const initialCharacter = {
    name: "UNIT_UNNAMED",
    form: null,      
    destiny: null,   
    master: null,    
    darkMark: null,  
    innerDemon: null 
  };

  const [character, setCharacter] = useState(initialCharacter);

  const resetApp = () => {
    setStep(1);
    setActiveTab('CREATOR');
    setCharacter(initialCharacter);
  };

  // --- LOGIC HELPERS ---
  const getStat = (n) => character.form ? character.form.baseStats[n] : 10;
  
  const getVital = (t) => {
    const statMap = { life: 'PHY', sanity: 'DRV', aura: 'SPR' };
    let total = 9 + Math.floor(getStat(statMap[t]) / 5);
    if (character.destiny?.bonuses?.[t]) total += character.destiny.bonuses[t];
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
    return { tier: tierKey, isArmor, stats: finalStats, name: archetype ? archetype.name : cleanName, category: archetype ? archetype.category : "Standard" };
  };

  const getSkillTotal = (skillId, statName, categoryId) => {
    if (!character.form) return 0;
    const baseVal = character.form.baseStats[statName] || 0;
    let bonus = 0;
    if (character.destiny?.bonuses) {
        if (character.destiny.bonuses[skillId]) bonus += character.destiny.bonuses[skillId];
        if (character.destiny.bonuses[categoryId]) bonus += character.destiny.bonuses[categoryId];
    }
    return baseVal + bonus;
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white font-mono overflow-hidden">
      
      {/* HEADER */}
      <div className="h-14 border-b border-red-900/50 flex items-center px-4 justify-between bg-red-950/20 shrink-0">
        <h1 className="text-lg font-black italic text-red-600 uppercase tracking-tighter">ASTRO INFERNO</h1>
        <div className="text-[10px] text-gray-500 font-bold border border-gray-800 px-2 py-1 uppercase">
          {activeTab === 'CREATOR' ? `PHASE 0${step}` : "SHEET"}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto pb-24 custom-scrollbar">
        
        {activeTab === 'CREATOR' ? (
          <div className="p-6 animate-in fade-in duration-300">
            {step === 1 && (
               <div className="space-y-6">
                 <h2 className="text-3xl font-black uppercase">Initialize</h2>
                 <input 
                   type="text" 
                   value={character.name === "UNIT_UNNAMED" ? "" : character.name}
                   placeholder="ENTER_NAME" 
                   className="w-full bg-white/5 border-b-2 border-red-600 p-4 text-xl font-bold uppercase focus:outline-none" 
                   onChange={(e) => setCharacter({...character, name: e.target.value.toUpperCase()})} 
                 />
                 <button onClick={() => setStep(2)} className="w-full bg-red-600 py-4 font-bold uppercase">Next Phase</button>
               </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <h2 className="text-xl font-black text-red-600 uppercase">Select Form</h2>
                {FORMS.map(form => (
                  <button key={form.id} onClick={() => setCharacter({...character, form: form})} className={`w-full text-left p-4 border transition-all ${character.form?.id === form.id ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500'}`}>
                    <div className="font-bold uppercase text-sm">{form.name}</div>
                    <div className="text-[10px] mt-1 line-clamp-2">{form.description}</div>
                  </button>
                ))}
                <button disabled={!character.form} onClick={() => setStep(3)} className="w-full bg-red-600 py-4 font-bold uppercase mt-4">Confirm</button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-2">
                <h2 className="text-xl font-black text-red-600 uppercase mb-4">Select Destiny</h2>
                <div className="grid grid-cols-2 gap-2">
                  {DESTINIES.map(destiny => (
                    <button key={destiny.id} onClick={() => setCharacter({...character, destiny: destiny})} className={`text-left p-3 border h-20 flex flex-col justify-center ${character.destiny?.id === destiny.id ? 'bg-red-600 text-white border-red-600' : 'border-white/10 text-gray-500'}`}>
                      <span className="font-bold uppercase text-[12px]">{destiny.name}</span>
                    </button>
                  ))}
                </div>
                <button disabled={!character.destiny} onClick={() => setStep(4)} className="w-full bg-red-600 py-4 font-bold uppercase mt-4">Confirm</button>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-red-600 uppercase">Finalize Lore</h2>
                <button 
                  onClick={() => {
                    const roll = Math.floor(Math.random() * 20) + 1;
                    const result = character.form.tables.master.find(m => roll >= m.min && roll <= m.max);
                    setCharacter({...character, master: result?.label});
                  }}
                  className="w-full border border-purple-500 p-4 uppercase font-bold text-purple-400"
                >
                  {character.master ? character.master : "Roll Master Connection"}
                </button>
                <button onClick={resetApp} className="w-full bg-green-600 py-4 font-bold uppercase mt-8 text-black">Complete & Save</button>
              </div>
            )}
          </div>
        ) : (
          /* CHARACTER SHEET TAB */
          <div className="p-4 space-y-6 animate-in slide-in-from-bottom-5">
            <div className="border-2 border-white/10 p-4 bg-white/5 relative overflow-hidden">
                <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
                    <span className="text-2xl font-black italic uppercase">{character.name}</span>
                    <span className="text-[10px] text-red-600 font-mono tracking-tighter">894-XJ</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {['life', 'sanity', 'aura'].map(v => (
                        <div key={v} className="bg-white/5 p-2 text-center border border-white/5">
                            <div className="text-[8px] uppercase text-gray-500">{v}</div>
                            <div className="text-xl font-black text-red-500">{getVital(v)}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-1 mb-6">
                   {['PHY', 'SPD', 'COG', 'DRV', 'CHA', 'SPR'].map(s => (
                     <div key={s} className="bg-black border border-white/10 p-2 text-center">
                        <div className="text-[8px] text-gray-400">{s}</div>
                        <div className="text-sm font-bold">{getStat(s)}</div>
                     </div>
                   ))}
                </div>

                {/* SKILLS */}
                <div className="space-y-4">
                    <div className="text-[10px] uppercase text-gray-500 tracking-widest border-b border-white/10 pb-1">Neural Network</div>
                    {SKILL_CATEGORIES.map(cat => (
                        <div key={cat.id} className="space-y-1">
                            <div className="text-[8px] text-red-800 font-bold uppercase">{cat.name}</div>
                            <div className="grid grid-cols-2 gap-1">
                                {cat.skills.map(skill => (
                                    <div key={skill.id} className="flex justify-between bg-white/5 p-1 px-2">
                                        <span className="text-[9px] uppercase">{skill.name}</span>
                                        <span className="text-[9px] font-bold text-gray-400">{getSkillTotal(skill.id, skill.stat, cat.id)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ARMORY */}
                {character.destiny && (
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <div className="text-[10px] uppercase text-gray-500 mb-3 tracking-widest">Loadout</div>
                        <div className="space-y-2">
                            {character.destiny.equipment.map((item, i) => {
                                const gear = getGearStats(item);
                                if (gear) return (
                                    <div key={i} className="flex justify-between items-center bg-white/5 border border-white/10 p-2">
                                        <div className="text-[9px] font-bold uppercase">{gear.name}</div>
                                        <div className="flex gap-2">
                                            {!gear.isArmor && <span className="text-red-500 text-[9px] font-bold">DMG {toRoman(gear.stats.dmg)}</span>}
                                            {gear.isArmor && <span className="text-blue-400 text-[9px] font-bold">ARM {gear.stats.arm}</span>}
                                        </div>
                                    </div>
                                );
                                return <div key={i} className="text-[9px] text-gray-500 uppercase">{item}</div>;
                            })}
                        </div>
                    </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* MOBILE NAV BAR */}
      <div className="h-20 border-t border-red-900/50 bg-black flex items-center justify-around px-2 shrink-0 z-50">
        <button onClick={() => setActiveTab('CREATOR')} className={`flex flex-col items-center gap-1 w-1/2 ${activeTab === 'CREATOR' ? 'text-red-600' : 'text-gray-600'}`}>
          <span className="text-[10px] font-black uppercase tracking-tighter">Creator</span>
          <div className={`h-1 w-12 transition-all ${activeTab === 'CREATOR' ? 'bg-red-600 shadow-[0_0_8px_red]' : 'bg-transparent'}`}></div>
        </button>
        <button onClick={() => setActiveTab('SHEET')} className={`flex flex-col items-center gap-1 w-1/2 ${activeTab === 'SHEET' ? 'text-red-600' : 'text-gray-600'}`}>
          <span className="text-[10px] font-black uppercase tracking-tighter">Sheet</span>
          <div className={`h-1 w-12 transition-all ${activeTab === 'SHEET' ? 'bg-red-600 shadow-[0_0_8px_red]' : 'bg-transparent'}`}></div>
        </button>
      </div>
    </div>
  );
}

export default App;