// src/components/Tabs/SquadTab.jsx
import React, { useState, useEffect, useRef } from 'react';

export default function SquadTab({
    claimGroundLoot,
    character,
    squadInput,
    setSquadInput,
    joinSquad,
    leaveSquad,
    encounter,
    squadRoster,
    getMaxVital,
    renderCombatLog,
    partyLoot, 
    claimLoot,
    playerStrikeBoss 
}) {
  const [shouldShake, setShouldShake] = useState(false);
  const prevLootCount = useRef(partyLoot?.length || 0);

  useEffect(() => {
    const currentCount = partyLoot?.length || 0;
    if (currentCount > prevLootCount.current) {
        const trigger = setTimeout(() => setShouldShake(true), 0);
        const reset = setTimeout(() => setShouldShake(false), 500);
        prevLootCount.current = currentCount;
        return () => { clearTimeout(trigger); clearTimeout(reset); };
    }
    prevLootCount.current = currentCount;
  }, [partyLoot?.length]);

  return (
    <div className={`p-4 space-y-4 animate-in fade-in z-10 relative ${shouldShake ? 'animate-impact' : ''}`}>
      
      <style>{`
        @keyframes impact {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); filter: brightness(1.2); }
          100% { transform: scale(1); }
        }
        .animate-impact { animation: impact 0.2s ease-out; border: 2px solid #06b6d4; }
      `}</style>

      {!character.id ? (
          <div className="text-center py-20 opacity-50 border border-dashed border-white/20 p-8">
              <div className="text-4xl mb-4">⚠</div>
              <div className="text-sm font-bold uppercase tracking-widest text-white">No Unit Deployed</div>
          </div>
      ) : !character.squadId ? (
          <div className="border border-cyan-900/50 p-6 bg-black/80 backdrop-blur-sm text-center">
             <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.3em] mb-6">Neural Link Offline</div>
             
             <div className="flex gap-2 mb-4">
                 <input 
                     type="text" 
                     value={squadInput} 
                     onChange={e => setSquadInput(e.target.value.toUpperCase())} 
                     placeholder="SQUAD CODE" 
                     className="flex-1 bg-cyan-950/20 border-b-2 border-cyan-600 p-4 text-2xl font-black uppercase text-center text-white" 
                     maxLength={6} 
                 />
                 <button 
                     onClick={() => setSquadInput(Math.random().toString(36).substring(2, 8).toUpperCase())} 
                     className="bg-cyan-950 border-b-2 border-cyan-900 text-cyan-500 px-4 font-black uppercase text-[10px] hover:bg-cyan-900 hover:text-cyan-300 transition-colors"
                 >
                     Generate
                 </button>
             </div>

             <button 
                 onClick={() => joinSquad(squadInput)} 
                 className="w-full bg-cyan-600 text-black py-4 font-bold uppercase hover:bg-white transition-colors"
             >
                 Establish Link
             </button>
          </div>
      ) : (
          <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-cyan-500/50 pb-2 mb-4">
                  <div>
                      <div className="text-[8px] text-cyan-500 font-bold uppercase tracking-[0.3em] mb-1">Active Network Link</div>
                      <div className="text-3xl font-black text-white tracking-[0.2em] leading-none drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">{character.squadId}</div>
                  </div>
                  <button onClick={leaveSquad} className="border border-red-900/50 bg-red-900/20 text-red-500 px-3 py-1 text-[9px] font-bold uppercase">Sever Link</button>
              </div>

              {/* NETWORK ACTIVITY LOG */}
              {renderCombatLog()}

              {/* NETWORK DROP POD (CYAN BOX) */}
              {partyLoot && partyLoot.length > 0 && (
                <div className="border-2 border-cyan-500 bg-cyan-950/40 p-4 mb-6 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  <div className="text-cyan-400 text-[10px] font-black uppercase mb-3 tracking-[0.2em] border-b border-cyan-900 pb-1 flex justify-between">
                    <span>Incoming Drop Pod Detected</span>
                    <span className="animate-ping">●</span>
                  </div>
                  <div className="space-y-2">
                    {partyLoot.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-black/80 p-3 border border-cyan-900">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-cyan-500 font-bold uppercase">{item.tier}</span>
                          <span className="text-xs text-white font-black uppercase">{item.name}</span>
                        </div>
                        <button onClick={() => claimLoot(item)} className="bg-cyan-600 text-black px-4 py-2 text-[10px] font-black uppercase hover:bg-white transition-all active:scale-95">Secure Asset</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HOSTILE THREAT TRACKER (ARMED) */}
              {encounter && (
                 <div className="border border-red-900 bg-red-950/20 p-4 mb-6 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
                     <div className="text-[8px] text-red-500 font-bold uppercase tracking-[0.3em] mb-2 flex justify-between">
                         <span>Hostile Threat Detected</span>
                         <span className="animate-pulse text-red-400">Weapons Free</span>
                     </div>
                     <div className="flex justify-between items-end mb-2">
                         <div className="text-2xl font-black text-white uppercase">{encounter.name}</div>
                         <div className="text-red-500 font-black">{encounter.hp} / {encounter.maxHp} HP</div>
                     </div>
                     <div className="h-4 w-full bg-black border border-red-900/50 mb-4 relative overflow-hidden">
                         <div style={{width: `${(encounter.hp / encounter.maxHp) * 100}%`}} className="h-full bg-red-600 transition-all duration-500"></div>
                     </div>
                     
                     {/* PLAYER WEAPON STRIKE CONTROLS */}
                     <div className="grid grid-cols-4 gap-2 border-t border-red-900/30 pt-3 mt-2">
                         <button onClick={() => playerStrikeBoss(1)} className="bg-red-950/40 border border-red-900/50 text-red-500 py-2 text-[10px] font-black uppercase hover:bg-red-900 hover:text-white transition-all active:scale-95">1 DMG</button>
                         <button onClick={() => playerStrikeBoss(2)} className="bg-red-950/60 border border-red-900/80 text-red-500 py-2 text-[10px] font-black uppercase hover:bg-red-900 hover:text-white transition-all active:scale-95">2 DMG</button>
                         <button onClick={() => playerStrikeBoss(5)} className="bg-red-900/60 border border-red-600 text-white py-2 text-[10px] font-black uppercase hover:bg-red-600 transition-all active:scale-95">5 DMG</button>
                         <button onClick={() => playerStrikeBoss(10)} className="bg-red-600 border border-red-500 text-black py-2 text-[10px] font-black uppercase hover:bg-white transition-all active:scale-95">10 DMG</button>
                     </div>
                 </div>
              )}

              {/* GROUND LOOT (YELLOW BOX) */}
              {encounter?.groundLoot?.length > 0 && (
                  <div className="border-2 border-yellow-500 bg-yellow-900/20 p-4 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                      <div className="text-[10px] text-yellow-500 font-bold uppercase tracking-[0.3em] mb-3 border-b border-yellow-500/50 pb-2">⚠️ ASSETS DETECTED IN SECTOR ⚠️</div>
                      <div className="space-y-2">
                          {encounter.groundLoot.map((item, index) => (
                              <div key={index} className="flex justify-between items-center bg-black/80 border border-yellow-900/50 p-2">
                                  <span className="text-xs font-black uppercase text-yellow-400">{item}</span>
                                  <button onClick={() => claimGroundLoot(item, index)} className="bg-yellow-600 text-black px-4 py-2 text-[10px] font-black uppercase">Claim</button>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
              
              {/* SQUAD ROSTER */}
              <div className="space-y-3">
                  {squadRoster.map(mate => (
                      <div key={mate.id} className={`border p-3 flex flex-col gap-3 relative overflow-hidden ${mate.id === character.id ? 'border-cyan-500/50 bg-cyan-950/10' : 'border-white/10 bg-black/60'}`}>
                          <div className="flex justify-between items-start relative z-10">
                              <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 bg-gray-900 border border-white/20">
                                      {mate.avatarUrl ? <img src={mate.avatarUrl} alt="Avatar" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-[8px] text-gray-600 font-bold uppercase">NO ID</div>}
                                  </div>
                                  <div>
                                      <div className="text-lg font-black italic uppercase text-white">{mate.name}</div>
                                      <div className="text-[9px] text-gray-400 uppercase">RK {mate.rank} • {mate.form?.name || 'UNKNOWN'}</div>
                                  </div>
                              </div>
                          </div>
                          <div className="space-y-1 relative z-10 border-t border-white/10 pt-2">
                              {['life', 'sanity', 'aura'].map(v => {
                                  const mMax = getMaxVital(v, mate);
                                  const mCur = mate.currentVitals?.[v] ?? mMax;
                                  const mPct = (mCur / mMax) * 100;
                                  return (
                                      <div key={v} className="flex items-center gap-2">
                                         <div className="w-8 text-[8px] font-bold text-gray-600 uppercase text-right tracking-widest">{v.substring(0,3)}</div>
                                         <div className="flex-1 h-1.5 bg-gray-900 relative">
                                             <div style={{width: `${mPct}%`}} className={`h-full ${v === 'life' ? 'bg-green-600' : v === 'sanity' ? 'bg-blue-600' : 'bg-purple-600'}`}></div>
                                         </div>
                                         <div className={`w-8 text-[9px] font-black text-right ${v === 'life' ? 'text-green-500' : 'text-blue-500'}`}>{mCur}</div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
}