// src/components/Tabs/OverseerTab.jsx
import React from 'react';

export default function OverseerTab({
    gmSquadId, squadInput, setSquadInput, joinAsGm, leaveGm,
    renderCombatLog, encounter, bossNameInput, setBossNameInput,
    bossHpInput, setBossHpInput, spawnBoss, updateBossHp, clearBoss,
    squadRoster, getMaxVital, triggerLootDrop, broadcastLoot, adjustUnitVital,
    beastiary
}) {
  return (
    <div className="p-4 space-y-6 animate-in fade-in pb-24">
      
      {/* OFFLINE STATE */}
      {!gmSquadId ? (
          <div className="border border-purple-900/50 p-6 bg-black/80 text-center shadow-[0_0_15px_rgba(147,51,234,0.2)]">
             <div className="text-[10px] text-purple-500 font-bold uppercase tracking-[0.3em] mb-6 animate-pulse">Overseer Protocol Standby</div>
             <input 
                 type="text" 
                 value={squadInput} 
                 onChange={e => setSquadInput(e.target.value.toUpperCase())} 
                 placeholder="TARGET SQUAD CODE" 
                 className="w-full bg-purple-950/20 border-b-2 border-purple-600 p-4 text-2xl font-black uppercase text-center text-white mb-4" 
                 maxLength={6} 
             />
             <button onClick={() => joinAsGm(squadInput)} className="w-full bg-purple-600 text-black py-4 font-black uppercase tracking-widest hover:bg-white transition-colors">Assume Direct Control</button>
          </div>
      ) : (
          <div className="space-y-6">
              
              {/* HEADER */}
              <div className="flex justify-between items-end border-b border-purple-500/50 pb-2">
                  <div>
                      <div className="text-[8px] text-purple-500 font-bold uppercase tracking-[0.3em] mb-1">Active Overseer Link</div>
                      <div className="text-3xl font-black text-white tracking-[0.2em] leading-none drop-shadow-[0_0_8px_rgba(147,51,234,0.8)]">{gmSquadId}</div>
                  </div>
                  <button onClick={leaveGm} className="border border-red-900/50 bg-red-900/20 text-red-500 px-3 py-1 text-[9px] font-bold uppercase hover:bg-red-900 hover:text-white transition-colors">Relinquish</button>
              </div>

              {/* NETWORK ACTIVITY LOG */}
              {renderCombatLog()}

              {/* LOGISTICS & SUPPLY */}
              <div className="grid grid-cols-2 gap-2">
                  <button onClick={broadcastLoot} className="border border-cyan-900 bg-cyan-950/30 text-cyan-400 p-3 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-900 hover:text-white transition-all active:scale-95 flex flex-col items-center">
                      <span className="text-lg mb-1">🛸</span> Beam Drop Pod
                  </button>
                  <button onClick={() => triggerLootDrop(3)} className="border border-yellow-900 bg-yellow-950/30 text-yellow-400 p-3 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-900 hover:text-white transition-all active:scale-95 flex flex-col items-center">
                      <span className="text-lg mb-1">📦</span> Scatter Ground Loot
                  </button>
              </div>

              {/* HOSTILE THREAT MANAGEMENT */}
              <div className="border border-red-900/50 bg-black p-4 relative overflow-hidden shadow-[inset_0_0_20px_rgba(220,38,38,0.05)]">
                 <div className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em] mb-4 border-b border-red-900/50 pb-2">Hostile Threat Management</div>
                 
                 {!encounter ? (
                     <div className="space-y-3 relative z-10">
                         {/* RESTORED BEASTIARY DROPDOWN */}
                         <select 
                             className="w-full bg-red-950/40 border border-red-900/50 p-3 text-white font-black uppercase cursor-pointer"
                             onChange={(e) => {
                                 const selectedName = e.target.value;
                                 if (!selectedName) return;

                                 // Search through all categories and their threats arrays
                                 let selectedThreat = null;
                                 for (const group of beastiary) {
                                     const found = group.threats?.find(t => t.name === selectedName);
                                     if (found) {
                                         selectedThreat = found;
                                         break;
                                     }
                                 }

                                 if (selectedThreat) {
                                     setBossNameInput(selectedThreat.name);
                                     setBossHpInput(selectedThreat.maxHp || selectedThreat.hp);
                                 }
                             }}
                         >
                             <option value="">-- DEPLOY FROM BEASTIARY --</option>
                             {beastiary?.map((group, groupIdx) => (
                                 <optgroup key={groupIdx} label={group.category} className="bg-red-950 text-red-500 font-bold">
                                     {group.threats?.map((threat, threatIdx) => (
                                         <option key={`${groupIdx}-${threatIdx}`} value={threat.name} className="text-white">
                                             {threat.name} (HP: {threat.maxHp || threat.hp})
                                         </option>
                                     ))}
                                 </optgroup>
                             ))}
                         </select>

                         {/* CUSTOM INPUTS */}
                         <div className="flex gap-2">
                             <input type="text" value={bossNameInput} onChange={e => setBossNameInput(e.target.value)} placeholder="CUSTOM DESIGNATION" className="flex-1 bg-red-950/20 border border-red-900/50 p-3 text-white font-black uppercase min-w-0" />
                             <input type="number" value={bossHpInput} onChange={e => setBossHpInput(e.target.value)} placeholder="HP" className="w-24 bg-red-950/20 border border-red-900/50 p-3 text-white font-black uppercase shrink-0 text-center" />
                         </div>
                         
                         <button onClick={spawnBoss} className="w-full bg-red-900 text-white font-black uppercase py-3 tracking-widest hover:bg-red-600 transition-colors">Manifest Threat</button>
                     </div>
                 ) : (
                     <div className="relative z-10">
                         {/* ACTIVE ENCOUNTER */}
                         <div className="flex justify-between items-end mb-2">
                             <div className="text-2xl font-black text-white uppercase tracking-widest leading-none">{encounter.name}</div>
                             <div className="text-red-500 font-black">{encounter.hp} / {encounter.maxHp} HP</div>
                         </div>
                         <div className="h-6 w-full bg-black border border-red-900/50 mb-4 relative overflow-hidden">
                             <div style={{width: `${(encounter.hp / encounter.maxHp) * 100}%`}} className="h-full bg-red-600 transition-all duration-500"></div>
                         </div>
                         
                         {/* HP CONTROLS */}
                         <div className="grid grid-cols-4 gap-2 mb-4">
                             <button onClick={() => updateBossHp(-10)} className="bg-red-950 border border-red-900 text-red-500 font-black py-2 hover:bg-red-900 hover:text-white transition-colors">-10</button>
                             <button onClick={() => updateBossHp(-1)} className="bg-red-950 border border-red-900 text-red-500 font-black py-2 hover:bg-red-900 hover:text-white transition-colors">-1</button>
                             <button onClick={() => updateBossHp(1)} className="bg-green-950 border border-green-900 text-green-500 font-black py-2 hover:bg-green-900 hover:text-white transition-colors">+1</button>
                             <button onClick={() => updateBossHp(10)} className="bg-green-950 border border-green-900 text-green-500 font-black py-2 hover:bg-green-900 hover:text-white transition-colors">+10</button>
                         </div>
                         <button onClick={clearBoss} className="w-full border border-red-900 text-red-600 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-900 hover:text-white transition-colors">Terminate Encounter</button>
                     </div>
                 )}
              </div>

              {/* TARGET ACQUISITION GRID */}
              <div className="border border-purple-900/50 bg-black p-4 shadow-[inset_0_0_20px_rgba(147,51,234,0.05)]">
                  <div className="text-[10px] text-purple-500 font-black uppercase tracking-[0.2em] mb-4 border-b border-purple-900/50 pb-2">Target Acquisition</div>
                  
                  {squadRoster.length === 0 ? (
                      <div className="text-center text-purple-900 text-xs font-black uppercase py-4">No Targets on Radar</div>
                  ) : (
                      <div className="space-y-4">
                          {squadRoster.map(mate => (
                              <div key={mate.id} className="border border-white/10 bg-black/60 p-3">
                                  <div className="text-sm font-black uppercase text-white mb-3">{mate.name}</div>
                                  
                                  <div className="space-y-2">
                                      {['life', 'sanity', 'aura'].map(v => {
                                          const mMax = getMaxVital(v, mate);
                                          const mCur = mate.currentVitals?.[v] ?? mMax;
                                          const color = v === 'life' ? 'green' : v === 'sanity' ? 'blue' : 'purple';
                                          
                                          return (
                                              <div key={v} className="flex items-center gap-2">
                                                 <div className="w-8 text-[8px] font-bold text-gray-500 uppercase tracking-widest">{v.substring(0,3)}</div>
                                                 <div className={`w-8 text-[10px] font-black text-right text-${color}-500`}>{mCur}</div>
                                                 
                                                 <div className="flex-1 flex gap-1 justify-end">
                                                     <button onClick={() => adjustUnitVital(mate.id, mate.name, v, -1)} className="bg-red-950/50 border border-red-900/50 text-red-500 px-3 py-1 text-[9px] font-black hover:bg-red-900 hover:text-white active:scale-95 transition-all">
                                                         -1
                                                     </button>
                                                     <button onClick={() => adjustUnitVital(mate.id, mate.name, v, -5)} className="bg-red-950/80 border border-red-900 text-red-500 px-3 py-1 text-[9px] font-black hover:bg-red-900 hover:text-white active:scale-95 transition-all">
                                                         -5
                                                     </button>
                                                 </div>
                                              </div>
                                          );
                                      })}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

          </div>
      )}
    </div>
  );
}