// src/components/Tabs/SheetTab.jsx
import React from 'react';
import { SKILL_CATEGORIES } from '../../data/skills';

const XP_THRESHOLD = 100; 
const HAZARDS = [
    { id: 'BURNING', color: 'text-orange-500', bg: 'bg-orange-900/20', border: 'border-orange-500/50' },
    { id: 'BLEEDING', color: 'text-red-600', bg: 'bg-red-900/20', border: 'border-red-600/50' },
    { id: 'POISONED', color: 'text-green-500', bg: 'bg-green-900/20', border: 'border-green-500/50' },
    { id: 'STUNNED', color: 'text-yellow-500', bg: 'bg-yellow-900/20', border: 'border-yellow-500/50' },
    { id: 'PANICKED', color: 'text-purple-500', bg: 'bg-purple-900/20', border: 'border-purple-500/50' },
];

export default function SheetTab({
    character, setCharacter,
    addXp, setViewPromotion, setViewData,
    updateWallet, updateVital, getMaxVital,
    toggleStatus, getStat, getSkillTotal, performRoll,
    updateConsumable, pullPin, getGearStats, getLootColor, toRoman,
    toggleEquip, removeLoot, generateLoot,
    isLogOpen, setIsLogOpen, syncNotes
}) {
  return (
    <>
      {/* VISUAL HAZARD OVERLAYS */}
      {(character.statuses || []).includes('BURNING') && <div className="pointer-events-none absolute inset-0 z-0 shadow-[inset_0_0_80px_rgba(234,88,12,0.4)] animate-pulse"></div>}
      {(character.statuses || []).includes('POISONED') && <div className="pointer-events-none absolute inset-0 z-0 shadow-[inset_0_0_80px_rgba(34,197,94,0.2)]"></div>}
      {(character.statuses || []).includes('BLEEDING') && <div className="pointer-events-none absolute inset-0 z-0 border-4 border-red-900/60"></div>}
      {(character.statuses || []).includes('PANICKED') && <div className="pointer-events-none absolute inset-0 z-0 shadow-[inset_0_0_80px_rgba(168,85,247,0.3)] animate-pulse"></div>}
      {(character.statuses || []).includes('STUNNED') && <div className="pointer-events-none absolute inset-0 z-0 bg-yellow-500/5 backdrop-blur-[1px] border border-dashed border-yellow-500/30"></div>}

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
                        {/* The Undo Buttons (Red Tint) */}
                        <button onClick={() => addXp(-5)} className="bg-red-950/20 border border-red-900/40 text-[9px] px-2 py-1 text-red-500/70 hover:text-red-400 hover:bg-red-900/40 transition-colors">-5 XP</button>
                        <button onClick={() => addXp(-1)} className="bg-red-950/20 border border-red-900/40 text-[9px] px-2 py-1 text-red-500/70 hover:text-red-400 hover:bg-red-900/40 transition-colors">-1 XP</button>
                        
                        {/* Your Original Add Buttons */}
                        <button onClick={() => addXp(1)} className="bg-white/5 border border-white/10 text-[9px] px-2 py-1 text-gray-400 hover:text-white transition-colors">+1 XP</button>
                        <button onClick={() => addXp(5)} className="bg-white/5 border border-white/10 text-[9px] px-2 py-1 text-gray-400 hover:text-white transition-colors">+5 XP</button>
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
{/* GENESIS TECH: BATTERIES */}
<div className="border border-cyan-900/50 bg-black p-3 mt-4 shadow-[inset_0_0_10px_rgba(6,182,212,0.05)]">
    <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">Batteries</span>
        <span className="text-lg font-black text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
            {character.consumables?.batteries || 0}
        </span>
    </div>
    <div className="flex gap-2">
        <button 
            onClick={() => updateConsumable('batteries', -1)} 
            className="flex-1 bg-black border border-cyan-900/50 text-cyan-600 py-1 font-black hover:bg-cyan-900/30 hover:text-cyan-400 transition-colors"
        >
            -
        </button>
        <button 
            onClick={() => updateConsumable('batteries', 1)} 
            className="flex-1 bg-black border border-cyan-900/50 text-cyan-600 py-1 font-black hover:bg-cyan-900/30 hover:text-cyan-400 transition-colors"
        >
            +
        </button>
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
<div className="mt-8 border border-red-900/50 bg-black/40 p-4 rounded-sm shadow-inner">
  <h3 className="text-xs text-red-500 font-bold uppercase tracking-[0.2em] mb-4 text-center border-b border-red-900/30 pb-2">
    Hazard Monitor
  </h3>
  
  <div className="flex flex-wrap justify-center gap-3">
    {["BURNING", "BLEEDING", "POISONED", "STUNNED", "PANICKED"].map(status => {
      const isActive = character.statuses?.includes(status);
      
      // Determine unique colors based on the hazard type
      let activeStyles = "";
      let hoverStyles = "";
      
      switch(status) {
        case "BURNING":
          activeStyles = "bg-orange-600 text-white border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.6)]";
          hoverStyles = "hover:border-orange-500 hover:text-orange-400";
          break;
        case "BLEEDING":
          activeStyles = "bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.6)]";
          hoverStyles = "hover:border-red-500 hover:text-red-400";
          break;
        case "POISONED":
          activeStyles = "bg-green-600 text-white border-green-500 shadow-[0_0_15px_rgba(22,163,74,0.6)]";
          hoverStyles = "hover:border-green-500 hover:text-green-400";
          break;
        case "STUNNED":
          activeStyles = "bg-yellow-600 text-white border-yellow-500 shadow-[0_0_15px_rgba(202,138,4,0.6)]";
          hoverStyles = "hover:border-yellow-500 hover:text-yellow-400";
          break;
        case "PANICKED":
          activeStyles = "bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.6)]";
          hoverStyles = "hover:border-purple-500 hover:text-purple-400";
          break;
        default:
          activeStyles = "bg-gray-600 text-white border-gray-500";
          hoverStyles = "hover:border-gray-500 hover:text-gray-400";
      }

      return (
        <button
          key={status}
          onClick={() => toggleStatus(status)}
          className={`
            px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-widest rounded-sm border transition-all duration-200
            ${isActive 
              ? `${activeStyles} animate-pulse` 
              : `bg-gray-900 text-gray-500 border-gray-700 ${hoverStyles}`
            }
          `}
        >
          {status}
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

            {/* DATA LOG */}
            <div className="mt-6 pt-4 border-t border-white/10">
                <button onClick={() => setIsLogOpen(!isLogOpen)} className="w-full flex justify-between items-center mb-2 border-b border-white/10 pb-1 group">
                     <div className="text-[10px] uppercase text-gray-500 tracking-widest group-hover:text-white transition-colors">Data Log (Field Notes)</div>
                     <div className="text-[10px] text-gray-500">{isLogOpen ? '▼' : '▶'}</div>
                </button>
                {isLogOpen && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <textarea value={character.notes || ""} onChange={(e) => setCharacter({...character, notes: e.target.value})} onBlur={syncNotes} placeholder="ENTER_MISSION_LOGS_HERE..." className="w-full bg-black/50 border border-white/10 p-3 text-xs text-gray-300 font-mono h-40 focus:outline-none focus:border-cyan-500/50 transition-colors custom-scrollbar placeholder:text-gray-700" />
                        <div className="text-right text-[8px] text-gray-600 uppercase mt-1">Data encrypts and syncs when clicking outside the box.</div>
                    </div>
                )}
            </div>

        </div>
      </div>
    </>
  );
}